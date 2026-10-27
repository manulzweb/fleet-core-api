// src/modules/users/users.service.spec.ts
import { ConflictException, NotFoundException } from '@nestjs/common';
import { RoleCode } from '../../common/enums/index.js';
import { UsersService } from './users.service.js';

const role = { id: 'r1', code: RoleCode.ADMIN, name: 'Admin' };
const user = (o: Record<string, any> = {}) => ({
  id: 'u1',
  name: 'N',
  email: 'a@b.c',
  passwordHash: 'h',
  isActive: true,
  roleId: 'r0',
  role: { id: 'r0', code: RoleCode.TECHNICIAN },
  ...o,
});
const make = (dao: Record<string, any>) => new UsersService(dao as any);
const data = { name: 'N', email: 'a@b.c', passwordHash: 'h' };

describe('UsersService', () => {
  it('findByEmail delegates to the dao', async () => {
    const u = user();
    expect(await make({ findByEmail: async () => u }).findByEmail('a')).toBe(u);
  });

  describe('create', () => {
    it('409 when the email already exists', async () => {
      const svc = make({ findByEmail: async () => user() });
      await expect(svc.create(data, RoleCode.ADMIN)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('404 when the role does not exist', async () => {
      const svc = make({
        findByEmail: async () => null,
        findRoleByCode: async () => null,
      });
      await expect(svc.create(data, RoleCode.ADMIN)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('creates an active user with the role', async () => {
      const create = vi.fn(async (u: any) => u);
      const svc = make({
        findByEmail: async () => null,
        findRoleByCode: async () => role,
        create,
      });
      await svc.create(data, RoleCode.ADMIN);
      expect(create).toHaveBeenCalledWith({
        ...data,
        role,
        roleId: 'r1',
        isActive: true,
      });
    });

    it('maps unique violation (23505) to 409', async () => {
      const svc = make({
        findByEmail: async () => null,
        findRoleByCode: async () => role,
        create: async () => {
          throw { code: '23505' };
        },
      });
      await expect(svc.create(data, RoleCode.ADMIN)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('rethrows unknown errors', async () => {
      const boom = new Error('boom');
      const svc = make({
        findByEmail: async () => null,
        findRoleByCode: async () => role,
        create: async () => {
          throw boom;
        },
      });
      await expect(svc.create(data, RoleCode.ADMIN)).rejects.toBe(boom);
    });
  });

  it('getById maps the user without the hash and 404s when missing', async () => {
    const res = await make({ findById: async () => user() }).getById('u1');
    expect(res).toMatchObject({ id: 'u1', email: 'a@b.c' });
    expect(res).not.toHaveProperty('passwordHash');
    await expect(
      make({ findById: async () => null }).getById('x'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('list paginates and maps', async () => {
    const svc = make({ findPaginated: async () => [[user()], 1] });
    const res = await svc.list({ page: 1, limit: 10 } as any);
    expect(res).toMatchObject({ total: 1, page: 1, limit: 10 });
    expect(res.items).toHaveLength(1);
  });

  describe('update', () => {
    it('updates name and role', async () => {
      const update = vi.fn(async (u: any) => u);
      const svc = make({
        findById: async () => user(),
        findRoleByCode: async () => role,
        update,
      });
      const res = await svc.update('u1', {
        name: 'New',
        role: RoleCode.ADMIN,
      } as any);
      expect(res).toMatchObject({ name: 'New' });
      expect(update.mock.calls[0][0]).toMatchObject({ roleId: 'r1' });
    });

    it('leaves fields untouched when dto is empty', async () => {
      const update = vi.fn(async (u: any) => u);
      const svc = make({ findById: async () => user(), update });
      await svc.update('u1', {} as any);
      expect(update.mock.calls[0][0]).toMatchObject({
        name: 'N',
        roleId: 'r0',
      });
    });

    it('404 for unknown role', async () => {
      const svc = make({
        findById: async () => user(),
        findRoleByCode: async () => null,
      });
      await expect(
        svc.update('u1', { role: RoleCode.ADMIN } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  it('setStatus toggles isActive', async () => {
    const update = vi.fn(async (u: any) => u);
    const svc = make({ findById: async () => user(), update });
    expect(await svc.setStatus('u1', false)).toEqual({
      id: 'u1',
      isActive: false,
    });
    expect(update).toHaveBeenCalled();
  });
});
