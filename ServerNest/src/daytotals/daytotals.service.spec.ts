import { BadRequestException } from '@nestjs/common';
import { initModels } from '../../test/helpers/init-models';
import { Daytotals } from '../database/models';
import { DaytotalsService } from './daytotals.service';

const setup = (existing: unknown = null) => {
  const totals = {
    findAll: jest.fn().mockResolvedValue([]),
    findByPk: jest.fn().mockResolvedValue(existing),
    create: jest.fn().mockImplementation(async (values: unknown) => ({ daytotal_id: 1, ...(values as object) })),
    update: jest.fn().mockResolvedValue([1]),
  };
  return { service: new DaytotalsService(totals as unknown as typeof Daytotals), totals };
};

describe('DaytotalsService', () => {
  beforeAll(() => { initModels(); });

  it('lists everything, or the totals of one day, with the employee without secrets', async () => {
    const { service, totals } = setup();
    await service.list();
    expect(totals.findAll.mock.calls[0][0].where).toEqual({});
    await service.list('2026-05-01');
    expect(totals.findAll.mock.calls[1][0].where).toEqual({ date: '2026-05-01' });
    expect(totals.findAll.mock.calls[1][0].include[0].attributes).toEqual(['user_id', 'name', 'email']);
    expect(() => service.list('nope')).toThrow(BadRequestException);
  });

  it('saves a total with the picker, or else the logged-in employee', async () => {
    const { service, totals } = setup();
    const result = await service.save({ type: 'user', id: 'u-1' }, { date: '2026-05-01', total_revenue: '1234.5', picker: 'u-2' });
    expect(totals.create.mock.calls[0][0]).toMatchObject({ date: '2026-05-01', total_revenue: '1234.50', user_id: 'u-2' });
    expect(result.success).toBe(true);
    await service.save({ type: 'user', id: 'u-1' }, { date: '2026-05-01', total_revenue: 5 });
    expect(totals.create.mock.calls[1][0].user_id).toBe('u-1');
  });

  it('updates a given id that exists', async () => {
    const { service, totals } = setup({ daytotal_id: 7 });
    await service.save(null, { daytotal_id: 7, date: '2026-05-01', total_revenue: 10 });
    expect(totals.update).toHaveBeenCalledWith(expect.objectContaining({ total_revenue: '10.00' }), expect.objectContaining({ where: { daytotal_id: 7 } }));
    expect(totals.create).not.toHaveBeenCalled();
  });

  it.each([
    ['no date', { total_revenue: 1 }],
    ['an invalid date', { date: '1-5-2026', total_revenue: 1 }],
    ['no revenue', { date: '2026-05-01' }],
    ['a negative revenue', { date: '2026-05-01', total_revenue: -1 }],
    ['revenue that is not a number', { date: '2026-05-01', total_revenue: 'lots' }],
    ['an id that is not a number', { date: '2026-05-01', total_revenue: 1, daytotal_id: 'x' }],
  ])('rejects %s', async (_name, body) => {
    const { service, totals } = setup();
    await expect(service.save(null, body)).rejects.toThrow(BadRequestException);
    expect(totals.create).not.toHaveBeenCalled();
  });
});
