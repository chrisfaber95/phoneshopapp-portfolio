import { Includeable } from 'sequelize';
import { HIDDEN_COLUMNS } from '../customers/customer-fields';
import { ActieOrderHasProduct, ActieOrderProductHasVariant, Customer, OrderInformation, Product, ProductVariant, User } from '../database/models';
import { productInformation } from '../products/product-includes';

const contact = (as: string): Includeable => ({
  model: OrderInformation,
  as,
  paranoid: false,
  include: [{ model: Customer, as: 'customer', attributes: { exclude: HIDDEN_COLUMNS } }],
});

// What the old Server loaded with every actie order (`{ all: true }` plus the lines with product, variants and the customer). The
// customer is loaded without password hash and tokens (`{ all: true }` included them).
export const actieOrderIncludes: Includeable[] = [
  { model: User, as: 'pickingUser' },
  { model: User, as: 'pickupUser' },
  contact('actie_order_information'),
  { model: OrderInformation, as: 'invoice_actie_order_information' },
  {
    model: ActieOrderHasProduct,
    as: 'product_list',
    include: [
      { model: Product, as: 'product', include: [productInformation] },
      { model: ActieOrderProductHasVariant, as: 'actie_order_product_variant_list', include: [{ model: ProductVariant, as: 'product_variant' }] },
    ],
  },
];
