import { BadRequestException } from '@nestjs/common';
import { Sequelize } from 'sequelize';
import { Productinformation } from '../database/models';
import { InformationImportService } from './information-import.service';

const setup = (existing: Record<string, unknown> = {}) => {
  const information = {
    findOne: jest.fn(async ({ where }: { where: { ean: string } }) => existing[where.ean] ?? null),
    update: jest.fn().mockResolvedValue([1]),
    create: jest.fn().mockResolvedValue({}),
  };
  const sequelize = { transaction: jest.fn(async (work: (t: unknown) => Promise<unknown>) => work({ id: 'tx' })) };
  return { service: new InformationImportService(sequelize as unknown as Sequelize, information as unknown as typeof Productinformation), information };
};

describe('InformationImportService', () => {
  it('updates the record with that EAN and creates the others, with the whitelisted fields only', async () => {
    const { service, information } = setup({ '1': { id: 5 } });
    await expect(service.importRecords([{ ean: '1', title: 'Melk', id: 99, evil: 'x' }, { ean: '2', imgurl: 'a.png' }])).resolves.toBe('nice');
    expect(information.update).toHaveBeenCalledWith({ ean: '1', title: 'Melk' }, expect.objectContaining({ where: { id: 5 } }));
    expect(information.create.mock.calls[0][0]).toEqual({ ean: '2', imgurl: 'a.png' });
  });

  it.each([
    ['not a list', { ean: '1' }],
    ['an empty list', []],
    ['a record without ean', [{ title: 'x' }]],
    ['an object as value', [{ ean: '1', title: { a: 1 } }]],
  ])('rejects %s', async (_name, body) => {
    const { service, information } = setup();
    await expect(service.importRecords(body)).rejects.toThrow(BadRequestException);
    expect(information.create).not.toHaveBeenCalled();
    expect(information.update).not.toHaveBeenCalled();
  });

  it('rejects too many records', async () => {
    const { service } = setup();
    await expect(service.importRecords(Array.from({ length: 1001 }, (_, i) => ({ ean: String(i) })))).rejects.toThrow(BadRequestException);
  });
});
