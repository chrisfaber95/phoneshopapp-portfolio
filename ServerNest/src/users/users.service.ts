import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UniqueConstraintError } from 'sequelize';
import { PasswordService } from '../auth/password.service';
import { whereFromQuery } from '../common/query-filter';
import { asRecord, pick } from '../customers/customer-fields';
import { User, Userrole } from '../database/models';

// Never sent to a client (the old list sent the password hash and the stored access token of every employee)
const SECRET_USER_COLUMNS = ['password', 'accessToken'];
const USER_FIELDS = ['name', 'email', 'cardnumber', 'nfc_token', 'nfc_serial', 'store', 'role_id'] as const;
const MIN_PASSWORD = 8;

const text = (value: unknown, max = 255): string | null => (typeof value === 'string' && value.trim() !== '' && value.length <= max ? value.trim() : null);

// Employees of the shop (the admin app). All of it is for employees (the access rules' default).
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User) private readonly users: typeof User,
    @InjectModel(Userrole) private readonly roles: typeof Userrole,
    private readonly passwords: PasswordService,
  ) {}

  // GET /user?<column>=: every employee with their role; filters on real columns, but not on the secrets
  list(query: Record<string, unknown>): Promise<User[]> {
    for (const column of SECRET_USER_COLUMNS) if (column in query) throw new BadRequestException({ error: `Unknown filter: ${column}` });
    return this.users.findAll({ where: whereFromQuery(User, query), include: [{ model: Userrole, as: 'user_role' }], attributes: { exclude: SECRET_USER_COLUMNS }, logging: false });
  }

  // GET /user/single/:id → { user } (null for an unknown id)
  async single(id: string): Promise<{ user: User | null }> {
    return { user: await this.users.findByPk(id, { include: [{ model: Userrole, as: 'user_role' }], attributes: { exclude: SECRET_USER_COLUMNS }, logging: false }) };
  }

  // GET /user/employ/:id → { user: [record] }. The old Server read a database view (employersView) that is not part of the schema
  // dump; this answers the employee with their role.
  async employ(id: string): Promise<{ user: User[] }> {
    const user = await this.users.findByPk(id, { include: [{ model: Userrole, as: 'user_role' }], attributes: { exclude: SECRET_USER_COLUMNS }, logging: false });
    return { user: user ? [user] : [] };
  }

  // POST /user: a new employee. Same answers as before: the user, or a text for a duplicate / incomplete record (HTTP 200).
  async add(body: unknown): Promise<unknown> {
    const input = asRecord(body);
    const fields = pick(input, USER_FIELDS);
    const name = text(fields.name);
    const email = text(fields.email)?.toLowerCase();
    const password = typeof input.password === 'string' && input.password.length >= MIN_PASSWORD ? input.password : null;
    if (!name || !email || !email.includes('@') || !password) return 'Naam, e-mailadres en een wachtwoord van minimaal 8 tekens zijn verplicht';
    if (!(await this.roleExists(fields.role_id))) return 'Onbekende rol';

    try {
      const created = await this.users.create({ ...fields, name, email, password: await this.passwords.hash(password) }, { logging: false });
      const answer = created.toJSON() as Record<string, unknown>;
      for (const column of SECRET_USER_COLUMNS) delete answer[column];
      return answer;
    } catch (error) {
      if (error instanceof UniqueConstraintError) return `De volgende velden bestaan al: ${Object.keys(error.fields).join('')}`;
      throw error;
    }
  }

  // PUT /user { user: { user_id, ...fields } }: changes an employee; a password in the body is hashed. Answers [number changed].
  async update(body: unknown): Promise<unknown> {
    const input = asRecord(asRecord(body).user);
    const id = input.user_id;
    if (typeof id !== 'string' || id === '') throw new BadRequestException({ error: 'user_id is required' });
    const changes: Record<string, unknown> = pick(input, USER_FIELDS);
    if (changes.email !== undefined) {
      const email = text(changes.email)?.toLowerCase();
      if (!email || !email.includes('@')) throw new BadRequestException({ error: 'Invalid e-mail address' });
      changes.email = email;
    }
    if (changes.role_id !== undefined && !(await this.roleExists(changes.role_id))) throw new BadRequestException({ error: 'Unknown role' });
    // an empty password field means "not changed" (the old Server would have stored the hash of an empty password)
    if (input.password !== undefined && input.password !== '') {
      if (typeof input.password !== 'string' || input.password.length < MIN_PASSWORD) throw new BadRequestException({ error: `The password needs at least ${MIN_PASSWORD} characters` });
      changes.password = await this.passwords.hash(input.password);
    }
    try {
      return await this.users.update(changes, { where: { user_id: id }, logging: false });
    } catch (error) {
      if (error instanceof UniqueConstraintError) return { err: `De volgende velden bestaan al: ${Object.keys(error.fields).join('')}` };
      this.logger.error(`updating user failed: ${(error as Error).message}`);
      throw error;
    }
  }

  private async roleExists(roleId: unknown): Promise<boolean> {
    return roleId !== undefined && roleId !== null && !!(await this.roles.findByPk(String(roleId), { logging: false }));
  }
}
