// src/modules/workshops/workshops.service.spec.ts
import { NotFoundException } from '@nestjs/common';
import { RoleCode } from '../../common/enums/index.js';
import { WorkshopsService } from './workshops.service.js';

const workshop = (o: Record<string, any> = {}) => ({
  id: 'w1',
  name: 'W',
  address: 'Street 1',
  isActive: true,
  ...o,
});
const make = (dao: Record<string, any>) => new WorkshopsService(dao as any);

describe('WorkshopsService', () => {
  it('creates active workshops', async () => {
    const create = vi.fn(async (w: any) => workshop(w));
    const res = await make({ create }).create({
      name: 'W',
      address: 'Street 1',
    } as any);
    expect(create).toHaveBeenCalledWith({
      name: 'W',
      address: 'Street 1',
      isActive: true,
    });
    expect(res).toMatchObject({ name: 'W', isActive: true });
  });

  it.each([
    [RoleCode.ADMIN, true, false],
    [RoleCode.ADMIN, false, true],
    [RoleCode.ADMIN, undefined, true],
    [RoleCode.TECHNICIAN, true, true],
  ])(
    'list as %s with includeInactive=%s uses onlyActive=%s',
    async (role, inc, only) => {
      const findPaginated = vi.fn(async () => [[workshop()], 1]);
      const res = await make({ findPaginated }).list(
        { page: 2, limit: 5, includeInactive: inc } as any,
        role,
      );
      expect(findPaginated).toHaveBeenCalledWith(2, 5, only);
      expect(res).toMatchObject({ total: 1, page: 2, limit: 5 });
    },
  );

  it('getById returns or 404s', async () => {
    expect(
      await make({ findById: async () => workshop() }).getById('w1'),
    ).toMatchObject({ id: 'w1' });
    await expect(
      make({ findById: async () => null }).getById('x'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update merges the dto', async () => {
    const svc = make({
      findById: async () => workshop(),
      update: async (w: any) => w,
    });
    expect(await svc.update('w1', { name: 'Z' } as any)).toMatchObject({
      name: 'Z',
      address: 'Street 1',
    });
  });

  it('setActive toggles the flag', async () => {
    const svc = make({
      findById: async () => workshop(),
      update: async (w: any) => w,
    });
    expect(await svc.setActive('w1', false)).toMatchObject({ isActive: false });
  });
});
