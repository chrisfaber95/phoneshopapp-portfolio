import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Principal } from '../auth/principal.service';
import { Daytotals, User } from '../database/models';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

// The revenue per day, entered in the admin app (employees only: the access rules' default)
@Injectable()
export class DaytotalsService {
  constructor(@InjectModel(Daytotals) private readonly totals: typeof Daytotals) {}

  // GET /daytotals and /daytotals/:date. The old Server ignored the date in the path and answered everything; with a date the
  // totals of that day are answered.
  list(date?: string): Promise<Daytotals[]> {
    if (date !== undefined && !DATE.test(date)) throw new BadRequestException({ error: 'Invalid date' });
    return this.totals.findAll({
      where: date ? { date } : {},
      include: [{ model: User, as: 'daytotals_user', attributes: ['user_id', 'name', 'email'] }],
      logging: false,
    });
  }

  // POST /daytotals { date, total_revenue, picker | user_id, daytotal_id? }: saves a day total (a given id is updated). The old
  // handler saved only the date (it read fields that do not exist) and then crashed on an undefined database variable.
  async save(principal: Principal | null, body: Record<string, unknown>): Promise<{ docs: Daytotals; success: true }> {
    const date = body.date;
    const revenue = Number(body.total_revenue);
    if (typeof date !== 'string' || !DATE.test(date)) throw new BadRequestException({ error: 'Invalid date' });
    if (body.total_revenue === undefined || body.total_revenue === '' || !Number.isFinite(revenue) || revenue < 0 || revenue > 99999999) throw new BadRequestException({ error: 'Invalid total_revenue' });
    const picker = body.picker ?? body.user_id ?? principal?.id;
    const userId = typeof picker === 'string' && picker !== '' ? picker : null;
    const id = body.daytotal_id === undefined || body.daytotal_id === null ? undefined : Number(body.daytotal_id);
    if (id !== undefined && !Number.isInteger(id)) throw new BadRequestException({ error: 'Invalid daytotal_id' });

    const values = { date, total_revenue: revenue.toFixed(2), user_id: userId, timestamp: new Date() };
    if (id !== undefined && (await this.totals.findByPk(id, { logging: false }))) {
      await this.totals.update(values, { where: { daytotal_id: id }, logging: false });
      return { docs: (await this.totals.findByPk(id, { logging: false })) as Daytotals, success: true };
    }
    return { docs: await this.totals.create(values, { logging: false }), success: true };
  }
}
