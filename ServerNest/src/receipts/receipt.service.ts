import { Injectable, Logger, NotFoundException, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import bwipjs from 'bwip-js';
import { dirname, resolve, sep } from 'node:path';
import pdfmake from 'pdfmake';
import roboto from 'pdfmake/fonts/Roboto';
import { CryptoService } from '../auth/crypto.service';
import { AppEnv } from '../config/env.validation';
import { Order, OrderHasProduct, OrderInformation, Product, Productinformation } from '../database/models';
import { orderWhere } from '../orders/order-reference';
import { discounts } from '../products/product-includes';
import { Address, Information, SHOPS_CONNECTION, Shop } from '../store/store.models';
import { ReceiptLine, ReceiptOrder, ReceiptShop, buildReceipt, firstPaymentRows, firstPaymentTotals, productRows, receiptTotals } from './receipt-document';

// the receipt only embeds data URIs (logo and barcode are made beforehand); nothing but the bundled fonts may be read
pdfmake.setFonts(roboto);
const fontsDir = dirname(require.resolve('pdfmake/fonts/Roboto'));
pdfmake.setUrlAccessPolicy(() => false);
pdfmake.setLocalAccessPolicy((file) => resolve(file).startsWith(fontsDir + sep) || resolve(file) === fontsDir);

const LOGO_TIMEOUT_MS = 5000;
const LOGO_MAX_BYTES = 2 * 1024 * 1024;

@Injectable()
export class ReceiptService {
  private readonly logger = new Logger(ReceiptService.name);

  constructor(
    @InjectModel(Order) private readonly orders: typeof Order,
    private readonly crypto: CryptoService,
    private readonly config: ConfigService<AppEnv, true>,
    // the store database is optional (SHOPS_DB_NAME=off): without it the receipt carries no shop details
    @Optional() @InjectModel(Shop, SHOPS_CONNECTION) private readonly shops?: typeof Shop,
  ) {}

  // GET /order/receipt/:orderRef?first=1 → the PDF. The order is found by UUID or by the encrypted reference of the e-mail links;
  // ?first=1 is the invoice of the first payment (the picking fee), otherwise the invoice of the picked order.
  async receipt(orderRef: string, first: boolean): Promise<Buffer> {
    const where = orderWhere(orderRef, this.crypto);
    const order = where
      ? await this.orders.findOne({
          where,
          paranoid: false,
          logging: false,
          include: [
            { model: OrderHasProduct, as: 'product_list', include: [{ model: Product, as: 'product', include: [{ model: Productinformation, as: 'product_information', attributes: ['title', 'ean'] }, discounts] }] },
            { model: OrderInformation, as: 'order_information' },
            { model: OrderInformation, as: 'invoice_order_information' },
          ],
        })
      : null;
    if (!order) throw new NotFoundException({ message: 'Order not found' });

    const plain = order.get({ plain: true }) as unknown as ReceiptOrder & { product_list: ReceiptLine[] };
    const shop = await this.findShop();
    const rows = first ? firstPaymentRows(plain) : productRows(plain.product_list, plain.status);
    const totals = first ? firstPaymentTotals(plain) : receiptTotals(plain.product_list, plain.status);
    const barcode = plain.winkelbon ? await this.barcode(plain.winkelbon) : '';
    const logo = await this.logo(shop?.information?.logo_url);
    return pdfmake.createPdf(buildReceipt({ order: plain, shop, rows, totals, barcode, logo, first })).getBuffer();
  }

  // The shop of this installation: RECEIPT_SHOP_ID, or the only/first shop of the store database
  private async findShop(): Promise<ReceiptShop | null> {
    if (!this.shops) return null;
    try {
      const id = this.config.get('RECEIPT_SHOP_ID', { infer: true });
      const include = [{ model: Information, as: 'information', include: [{ model: Address, as: 'address' }] }];
      const shop = id
        ? await this.shops.findOne({ where: { shop_id: id }, include, attributes: ['shop_id', 'shopname'], logging: false })
        : await this.shops.findOne({ include, attributes: ['shop_id', 'shopname'], order: [['shop_id', 'ASC']], logging: false });
      return shop ? (shop.get({ plain: true }) as ReceiptShop) : null;
    } catch (error) {
      this.logger.warn(`shop details for the receipt not available: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  // A PNG data URI, or '' when the barcode cannot be made
  private async barcode(code: string): Promise<string> {
    try {
      const png = await bwipjs.toBuffer({ bcid: 'code128', text: code, scale: 2, height: 15, includetext: true, textxalign: 'center', textsize: 12, paddingwidth: 10 });
      return `data:image/png;base64,${Buffer.from(png).toString('base64')}`;
    } catch (error) {
      this.logger.warn(`barcode failed: ${error instanceof Error ? error.message : String(error)}`);
      return '';
    }
  }

  // pdfmake only embeds PNG/JPEG: the logo of the shop as a data URI, or '' (then the shop name is printed). Only http(s), a time and a
  // size limit apply, because the address comes from the database.
  private async logo(url: string | null | undefined): Promise<string> {
    if (!url || !/^https?:\/\//i.test(url)) return '';
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(LOGO_TIMEOUT_MS) });
      const type = (response.headers.get('content-type') || '').split(';')[0];
      if (!response.ok || !['image/png', 'image/jpeg'].includes(type)) return '';
      const bytes = Buffer.from(await response.arrayBuffer());
      return bytes.length > LOGO_MAX_BYTES ? '' : `data:${type};base64,${bytes.toString('base64')}`;
    } catch {
      return '';
    }
  }
}
