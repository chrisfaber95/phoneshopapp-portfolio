import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { asRecord, pick } from '../customers/customer-fields';
import { Productinformation } from '../database/models';

const FIELDS = ['ean', 'variant', 'title', 'url', 'dataproduct', 'datasyndyproductid', 'omschrijving', 'imgurl', 'ingredients'] as const;
const MAX_RECORDS = 1000;

// POST /info/post: import or refresh product information (the admin app sends the records of a product feed)
@Injectable()
export class InformationImportService {
  constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
    @InjectModel(Productinformation) private readonly information: typeof Productinformation,
  ) {}

  // Records are matched on their EAN: an existing record has the given fields updated, a new EAN is created. (The old Server
  // relied on a unique key that the table does not have, so every import added duplicates.) Answers "nice" like the old Server.
  async importRecords(body: unknown): Promise<string> {
    if (!Array.isArray(body) || body.length === 0 || body.length > MAX_RECORDS) throw new BadRequestException({ error: `Send a list of 1 to ${MAX_RECORDS} records` });
    const records = body.map((entry) => {
      const record = pick(asRecord(entry), FIELDS);
      if (typeof record.ean !== 'string' || record.ean.trim() === '') throw new BadRequestException({ error: 'Every record needs an ean' });
      for (const [key, value] of Object.entries(record)) {
        if (value !== null && typeof value !== 'string' && typeof value !== 'number') throw new BadRequestException({ error: `Invalid value for ${key}` });
      }
      return record;
    });

    await this.sequelize.transaction(async (transaction) => {
      for (const record of records) {
        const existing = await this.information.findOne({ where: { ean: record.ean as string }, attributes: ['id'], transaction, logging: false });
        if (existing) await this.information.update(record, { where: { id: existing.id }, transaction, logging: false });
        else await this.information.create(record as never, { transaction, logging: false });
      }
    });
    return 'nice';
  }
}
