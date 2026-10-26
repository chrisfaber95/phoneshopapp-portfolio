import { BadRequestException } from '@nestjs/common';
import { UniqueConstraintError } from 'sequelize';
import { initModels } from '../../test/helpers/init-models';
import { PasswordService } from '../auth/password.service';
import { User, Userrole } from '../database/models';
import { UsersService } from './users.service';

const setup = (over: { role?: unknown; createError?: Error } = {}) => {
  const users = {
    getAttributes: () => ({ user_id: {}, name: {}, email: {}, password: {}, accessToken: {}, role_id: {} }),
    findAll: jest.fn().mockResolvedValue([]),
    findByPk: jest.fn().mockResolvedValue({ user_id: 'u-1' }),
    create: over.createError ? jest.fn().mockRejectedValue(over.createError) : jest.fn().mockResolvedValue({ toJSON: () => ({ user_id: 'u-9', name: 'Kees', password: 'hash', accessToken: 'tok' }) }),
    update: jest.fn().mockResolvedValue([1]),
  };
  const roles = { findByPk: jest.fn().mockResolvedValue(over.role === undefined ? { role_id: '2' } : over.role) };
  const passwords = { hash: jest.fn().mockResolvedValue('hashed') };
  const service = new UsersService(users as unknown as typeof User, roles as unknown as typeof Userrole, passwords as unknown as PasswordService);
  return { service, users, roles, passwords };
};

const newUser = (over: Record<string, unknown> = {}) => ({ name: 'Kees', email: 'Kees@Example.invalid', password: 'long-enough', role_id: '2', ...over });

describe('UsersService', () => {
  beforeAll(() => { initModels(); });

  describe('reading', () => {
    it('never sends password hash or access token, and does not filter on them', async () => {
      const { service, users } = setup();
      await service.list({ name: 'Kees' });
      expect(users.findAll.mock.calls[0][0].attributes).toEqual({ exclude: ['password', 'accessToken'] });
      expect(() => service.list({ password: 'x' })).toThrow(BadRequestException);
      await service.single('u-1');
      expect(users.findByPk.mock.calls[0][1].attributes).toEqual({ exclude: ['password', 'accessToken'] });
    });

    it('single answers { user: null } for an unknown id; employ answers a list', async () => {
      const { service, users } = setup();
      users.findByPk.mockResolvedValue(null);
      await expect(service.single('nope')).resolves.toEqual({ user: null });
      await expect(service.employ('nope')).resolves.toEqual({ user: [] });
    });
  });

  describe('add', () => {
    it('hashes the password, lower-cases the e-mail and answers without secrets', async () => {
      const { service, users, passwords } = setup();
      const answer = await service.add(newUser({ is_admin: 1, password_reset: 'x' }));
      expect(passwords.hash).toHaveBeenCalledWith('long-enough');
      expect(users.create.mock.calls[0][0]).toEqual({ name: 'Kees', email: 'kees@example.invalid', role_id: '2', password: 'hashed' });
      expect(answer).toEqual({ user_id: 'u-9', name: 'Kees' });
    });

    it.each([
      ['no name', newUser({ name: '' })],
      ['an invalid e-mail', newUser({ email: 'nope' })],
      ['a short password', newUser({ password: 'short' })],
    ])('answers a text for %s and stores nothing', async (_name, body) => {
      const { service, users } = setup();
      await expect(service.add(body)).resolves.toEqual(expect.stringContaining('verplicht'));
      expect(users.create).not.toHaveBeenCalled();
    });

    it('refuses an unknown role', async () => {
      const { service, users } = setup({ role: null });
      await expect(service.add(newUser())).resolves.toBe('Onbekende rol');
      expect(users.create).not.toHaveBeenCalled();
    });

    it('answers the duplicate text of the old Server', async () => {
      const error = new UniqueConstraintError({ fields: { email: 'x' } } as never);
      await expect(setup({ createError: error }).service.add(newUser())).resolves.toBe('De volgende velden bestaan al: email');
    });
  });

  describe('update', () => {
    it('changes whitelisted fields only and hashes a new password', async () => {
      const { service, users } = setup();
      await service.update({ user: { user_id: 'u-1', name: 'New', password: 'a-new-password', accessToken: 'x', createdAt: 'y' } });
      expect(users.update.mock.calls[0][0]).toEqual({ name: 'New', password: 'hashed' });
      expect(users.update.mock.calls[0][1].where).toEqual({ user_id: 'u-1' });
    });

    it.each([
      ['no user_id', { user: { name: 'x' } }],
      ['a short password', { user: { user_id: 'u-1', password: 'short' } }],
      ['an invalid e-mail', { user: { user_id: 'u-1', email: 'nope' } }],
    ])('rejects %s', async (_name, body) => {
      const { service, users } = setup();
      await expect(service.update(body)).rejects.toThrow(BadRequestException);
      expect(users.update).not.toHaveBeenCalled();
    });

    it('rejects an unknown role', async () => {
      await expect(setup({ role: null }).service.update({ user: { user_id: 'u-1', role_id: '99' } })).rejects.toMatchObject({ response: { error: 'Unknown role' } });
    });
  });
});

describe('UsersService update with an empty password field', () => {
  it('leaves the password alone', async () => {
    const users = { update: jest.fn().mockResolvedValue([1]) };
    const passwords = { hash: jest.fn() };
    const service = new UsersService(users as never, {} as never, passwords as never);
    await service.update({ user: { user_id: 'u-1', name: 'New', password: '' } });
    expect(passwords.hash).not.toHaveBeenCalled();
    expect(users.update.mock.calls[0][0]).toEqual({ name: 'New' });
  });
});
