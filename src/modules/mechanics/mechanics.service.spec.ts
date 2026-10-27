// src/modules/mechanics/mechanics.service.spec.ts
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MechanicsService } from './mechanics.service.js';

const mech = (o: Record<string, any> = {}) => ({
  id: 'm1',
  name: 'M',
  email: 'm@x.com',
  specialty: 'Engine',
  userId: null,
  isActive: true,
  ...o,
});
const make = (dao: Record<string, any>, users: Record<string, any> = {}) =>
  new MechanicsService(dao as any, users as any);
const dto = { name: 'M', email: 'm@x.com', specialty: 'Engine' } as any;

describe('MechanicsService', () => {
  describe('create', () => {
    it('409 on duplicate email', async () => {
      const svc = make({ findByEmail: async () => mech({ id: 'other' }) });
      await expect(svc.create(dto)).rejects.toBeInstanceOf(ConflictException);
    });

    it('404 when the linked user does not exist', async () => {
      const svc = make(
        { findByEmail: async () => null },
        {
          getEntity: async () => {
            throw new NotFoundException();
          },
        },
      );
      await expect(svc.create({ ...dto, userId: 'u1' })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('409 when the user is already linked', async () => {
      const svc = make(
        {
          findByEmail: async () => null,
          findByUserId: async () => mech({ id: 'other' }),
        },
        { getEntity: async () => ({ id: 'u1' }) },
      );
      await expect(svc.create({ ...dto, userId: 'u1' })).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('creates an active mechanic with null user by default', async () => {
      const create = vi.fn(async (m: any) => mech(m));
      const svc = make({ findByEmail: async () => null, create });
      await svc.create(dto);
      expect(create).toHaveBeenCalledWith({
        ...dto,
        isActive: true,
        userId: null,
      });
    });

    it('creates with a free linked user', async () => {
      const create = vi.fn(async (m: any) => mech(m));
      const svc = make(
        {
          findByEmail: async () => null,
          findByUserId: async () => null,
          create,
        },
        { getEntity: async () => ({ id: 'u1' }) },
      );
      const res = await svc.create({ ...dto, userId: 'u1' });
      expect(res).toMatchObject({ userId: 'u1' });
    });

    it('maps DB unique constraint to a descriptive 409', async () => {
      const svc = make({
        findByEmail: async () => null,
        create: async () => {
          throw { code: '23505', constraint: 'mechanics_email_key' };
        },
      });
      await expect(svc.create(dto)).rejects.toThrow(
        'A mechanic with this email already exists',
      );
    });

    it('rethrows other errors', async () => {
      const boom = new Error('x');
      const svc = make({
        findByEmail: async () => null,
        create: async () => {
          throw boom;
        },
      });
      await expect(svc.create(dto)).rejects.toBe(boom);
    });
  });

  it('list passes the isActive filter', async () => {
    const findPaginated = vi.fn(async () => [[mech()], 1]);
    const res = await make({ findPaginated }).list({
      page: 1,
      limit: 10,
      isActive: true,
    } as any);
    expect(findPaginated).toHaveBeenCalledWith(1, 10, true);
    expect(res.total).toBe(1);
  });

  it('getById returns or 404s', async () => {
    expect(
      await make({ findById: async () => mech() }).getById('m1'),
    ).toMatchObject({ id: 'm1' });
    await expect(
      make({ findById: async () => null }).getById('x'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findByUserId delegates', async () => {
    const m = mech();
    expect(await make({ findByUserId: async () => m }).findByUserId('u')).toBe(
      m,
    );
  });

  describe('update', () => {
    it('allows keeping own email', async () => {
      const svc = make({
        findById: async () => mech(),
        findByEmail: async () => mech(),
        update: async (m: any) => m,
      });
      expect(await svc.update('m1', { email: 'm@x.com' })).toMatchObject({
        email: 'm@x.com',
      });
    });

    it('409 when email belongs to another mechanic', async () => {
      const svc = make({
        findById: async () => mech(),
        findByEmail: async () => mech({ id: 'other' }),
      });
      await expect(
        svc.update('m1', { email: 'z@x.com' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('maps DB conflicts on save', async () => {
      const svc = make({
        findById: async () => mech(),
        update: async () => {
          throw { code: '23505', constraint: 'mechanics_user_id_key' };
        },
      });
      await expect(svc.update('m1', { specialty: 'x' })).rejects.toThrow(
        'already linked',
      );
    });
  });

  it('setActive toggles the flag and 404s', async () => {
    const svc = make({
      findById: async () => mech(),
      update: async (m: any) => m,
    });
    expect(await svc.setActive('m1', false)).toMatchObject({
      isActive: false,
    });
    await expect(
      make({ findById: async () => null }).setActive('x', true),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
