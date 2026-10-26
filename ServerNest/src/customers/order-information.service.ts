import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { assertCustomerAccess } from '../auth/ownership';
import { Principal } from '../auth/principal.service';
import { whereFromQuery } from '../common/query-filter';
import { Customer, OrderInformation } from '../database/models';
import { SECRET_COLUMNS } from './customer-fields';

// The saved delivery / invoice details of customers (Order_Information)
@Injectable()
export class OrderInformationService {
  private readonly logger = new Logger(OrderInformationService.name);

  constructor(@InjectModel(OrderInformation) private readonly information: typeof OrderInformation) {}

  // GET /order_information?<column>=: the records with their customer (without password hash, token and reset token: the old Server
  // sent them all). A logged-in customer only ever gets their own records; employees and the "customer_id in the query" way see
  // what they ask for.
  list(principal: Principal | null, query: Record<string, unknown>): Promise<OrderInformation[]> {
    const where = whereFromQuery(OrderInformation, query) as Record<string, unknown>;
    if (principal?.type === 'customer') where.customer_id = principal.id;
    return this.information.findAll({
      where,
      include: [{ model: Customer, as: 'customer', attributes: { exclude: SECRET_COLUMNS } }],
      logging: false,
    });
  }

  // DELETE /order_information { order_information_id }: removes (soft delete) one record; a customer can only remove their own.
  // Answers the number removed.
  async remove(principal: Principal | null, body: Record<string, unknown>): Promise<number | { err: string }> {
    if (!principal) throw new UnauthorizedException({ error: 'Authentication required' });
    try {
      const record = await this.information.findByPk(body.order_information_id as string, { logging: false });
      if (!record) return 0;
      assertCustomerAccess(principal, record.customer_id);
      return await this.information.destroy({ where: { order_information_id: record.order_information_id }, logging: false });
    } catch (err) {
      if ((err as { getStatus?: () => number }).getStatus) throw err; // an access error
      this.logger.error(`removing order information failed: ${(err as Error).message}`);
      return { err: 'Verwijderen mislukt' };
    }
  }
}
