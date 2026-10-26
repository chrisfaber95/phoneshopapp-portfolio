import { Department } from '../database/models';
import { DepartmentsService } from './departments.service';

const serviceWith = (model: Partial<Record<'findAll' | 'destroy', jest.Mock>>) => new DepartmentsService(model as unknown as typeof Department);

// the real model's attributes are needed by the filter helper
jest.mock('../database/models', () => ({ Department: { getAttributes: () => ({ department_id: {}, visible: {} }) } }));

describe('DepartmentsService', () => {
  it('lists departments, filtered by the query', async () => {
    const findAll = jest.fn().mockResolvedValue([{ department_id: 1 }]);
    const result = await serviceWith({ findAll }).list({ visible: '1' });
    expect(result).toEqual([{ department_id: 1 }]);
    expect(findAll).toHaveBeenCalledWith({ where: { visible: '1' }, logging: false });
  });

  it('deletes by id and answers the number of deleted rows', async () => {
    const destroy = jest.fn().mockResolvedValue(1);
    expect(await serviceWith({ destroy }).remove('5')).toBe(1);
    expect(destroy).toHaveBeenCalledWith({ where: { department_id: '5' } });
  });

  it.each([[undefined], [''], ['abc'], ['1 OR 1=1'], [['1', '2']], [5]])('does not delete without a numeric id: %j', async (id) => {
    const destroy = jest.fn();
    expect(await serviceWith({ destroy }).remove(id)).toEqual({ err: 'department_id must be a number' });
    expect(destroy).not.toHaveBeenCalled();
  });

  it('answers { err } when the database refuses (for example a department that is still in use)', async () => {
    const destroy = jest.fn().mockRejectedValue(new Error('FK constraint'));
    expect(await serviceWith({ destroy }).remove('5')).toEqual({ err: 'Verwijderen mislukt' });
  });
});
