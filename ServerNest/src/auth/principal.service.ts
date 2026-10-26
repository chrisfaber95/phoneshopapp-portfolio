import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Customer, User } from '../database/models';

export interface Principal {
  type: 'user' | 'customer';
  id: string;
}

// Finds the account behind a token: an employee (User) or a customer. The ids are UUIDs, so they do not collide.
@Injectable()
export class PrincipalService {
  constructor(
    @InjectModel(User) private readonly users: typeof User,
    @InjectModel(Customer) private readonly customers: typeof Customer,
  ) {}

  async find(id: string): Promise<Principal | null> {
    if (await this.users.findByPk(id, { attributes: ['user_id'], logging: false })) return { type: 'user', id };
    if (await this.customers.findByPk(id, { attributes: ['customer_id'], logging: false })) return { type: 'customer', id };
    return null;
  }
}
