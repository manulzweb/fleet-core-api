// src/modules/maintenances/maintenances.service.spec.ts
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  MaintenanceStatus as MS,
  MaintenanceType,
  RoleCode,
  VehicleStatus,
} from '../../common/enums/index.js';
import { MaintenancesService } from './maintenances.service.js';

const em = { tx: true };
const admin = { id: 'ua', role: RoleCode.ADMIN };
const tech = { id: 'ut', role: RoleCode.TECHNICIAN };

const vehicle = (o: Record<string, any> = {}) => ({
  id: 'v1',
  plate: 'ABC123',
  status: VehicleStatus.AVAILABLE,
  currentMileage: 100,
  ...o,
});
const maint = (o: Record<string, any> = {}) => ({
  id: 'mt1',
  type: MaintenanceType.PREVENTIVE,
  description: 'd',
  initialMileage: 100,
  scheduledStartAt: new Date('2030-01-01T10:00:00Z'),
  scheduledEndAt: new Date('2030-01-01T12:00:00Z'),
  status: MS.SCHEDULED,
  vehicleId: 'v1',
  mechanicId: 'me1',
  workshopId: 'w1',
  workPerformed: null,
  finalCost: null,
  completedAt: null,
  finalMileage: null,
  vehicle: {},
  mechanic: {},
  workshop: {},
  ...o,
});

function setup(
  over: {
    dao?: Record<string, any>;
    vehicleDao?: Record<string, any>;
    mechanicDao?: Record<string, any>;
    workshopDao?: Record<string, any>;
  } = {},
) {
  const ds = {
    transaction: vi.fn(async (cb: (m: unknown) => unknown) => cb(em)),
  };
  const dao = {
    create: vi.fn(async (d: any) => maint({ ...d })),
    mechanicHasOverlap: vi.fn(async () => false),
    findById: vi.fn(async () => maint()),
    findByIdForUpdate: vi.fn(async () => maint()),
    findPaginated: vi.fn(async () => [[maint()], 1]),
    findCompletedByVehicle: vi.fn(async () => []),
    update: vi.fn(async (m: any) => m),
    ...over.dao,
  };
  const vehicleDao = {
    findByIdForUpdate: vi.fn(async () => vehicle()),
    hasActiveMaintenance: vi.fn(async () => false),
    existsById: vi.fn(async () => true),
    update: vi.fn(async (v: any) => v),
    ...over.vehicleDao,
  };
  const mechanicDao = {
    findById: vi.fn(async () => ({ id: 'me1', isActive: true })),
    findByUserId: vi.fn(async () => ({ id: 'me1' })),
    ...over.mechanicDao,
  };
  const workshopDao = {
    findById: vi.fn(async () => ({ id: 'w1', isActive: true })),
    ...over.workshopDao,
  };
  const svc = new MaintenancesService(
    ds as any,
    dao as any,
    vehicleDao as any,
    mechanicDao as any,
    workshopDao as any,
  );
  return { svc, ds, dao, vehicleDao, mechanicDao, workshopDao };
}

const createDto = (o: Record<string, any> = {}) =>
  ({
    type: MaintenanceType.PREVENTIVE,
    description: 'd',
    initialMileage: 100,
    scheduledStartAt: new Date('2030-01-01T10:00:00Z'),
    scheduledEndAt: new Date('2030-01-01T12:00:00Z'),
    vehicleId: 'v1',
    mechanicId: 'me1',
    workshopId: 'w1',
    ...o,
  }) as any;

describe('MaintenancesService.create', () => {
  it('creates a SCHEDULED maintenance inside a transaction', async () => {
    const { svc, dao, ds } = setup();
    const res = await svc.create(createDto());
    expect(ds.transaction).toHaveBeenCalledTimes(1);
    expect(dao.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: MS.SCHEDULED }),
      em,
    );
    expect(res).toMatchObject({ status: MS.SCHEDULED, vehicleId: 'v1' });
  });

  it('400 when end is not after start (no transaction opened)', async () => {
    const { svc, ds } = setup();
    const d = createDto({ scheduledEndAt: new Date('2030-01-01T10:00:00Z') });
    await expect(svc.create(d)).rejects.toBeInstanceOf(BadRequestException);
    expect(ds.transaction).not.toHaveBeenCalled();
  });

  it('404 when vehicle is missing', async () => {
    const { svc } = setup({
      vehicleDao: { findByIdForUpdate: async () => null },
    });
    await expect(svc.create(createDto())).rejects.toThrow('Vehicle not found');
  });

  it('404 when mechanic is missing', async () => {
    const { svc } = setup({ mechanicDao: { findById: async () => null } });
    await expect(svc.create(createDto())).rejects.toThrow('Mechanic not found');
  });

  it('404 when workshop is missing', async () => {
    const { svc } = setup({ workshopDao: { findById: async () => null } });
    await expect(svc.create(createDto())).rejects.toThrow('Workshop not found');
  });

  it('409 when vehicle is inactive', async () => {
    const { svc } = setup({
      vehicleDao: {
        findByIdForUpdate: async () =>
          vehicle({ status: VehicleStatus.INACTIVE }),
      },
    });
    await expect(svc.create(createDto())).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('409 when mechanic is inactive', async () => {
    const { svc } = setup({
      mechanicDao: { findById: async () => ({ id: 'me1', isActive: false }) },
    });
    await expect(svc.create(createDto())).rejects.toThrow(
      'The mechanic is inactive',
    );
  });

  it('409 when workshop is inactive', async () => {
    const { svc } = setup({
      workshopDao: { findById: async () => ({ id: 'w1', isActive: false }) },
    });
    await expect(svc.create(createDto())).rejects.toThrow(
      'The workshop is inactive',
    );
  });

  it('400 when initial mileage is below the vehicle mileage', async () => {
    const { svc } = setup();
    await expect(
      svc.create(createDto({ initialMileage: 50 })),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('409 when the vehicle already has active maintenance', async () => {
    const { svc } = setup({
      vehicleDao: { hasActiveMaintenance: async () => true },
    });
    await expect(svc.create(createDto())).rejects.toThrow(
      'already has active maintenance',
    );
  });

  it('409 when the mechanic overlaps another maintenance', async () => {
    const { svc } = setup({ dao: { mechanicHasOverlap: async () => true } });
    await expect(svc.create(createDto())).rejects.toThrow('overlapping');
  });

  it('maps DB constraint violations to 409 with a descriptive message', async () => {
    const { svc } = setup({
      dao: {
        create: async () => {
          throw { code: '23505', constraint: 'uq_mnt_vehicle_active' };
        },
      },
    });
    await expect(svc.create(createDto())).rejects.toThrow(
      'The vehicle already has active maintenance',
    );
    const second = setup({
      dao: {
        create: async () => {
          throw { code: '23P01', constraint: 'excl_mnt_mechanic_overlap' };
        },
      },
    });
    await expect(second.svc.create(createDto())).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('rethrows unknown errors', async () => {
    const boom = new Error('boom');
    const { svc } = setup({
      dao: {
        create: async () => {
          throw boom;
        },
      },
    });
    await expect(svc.create(createDto())).rejects.toBe(boom);
  });
});

describe('MaintenancesService reads', () => {
  it('findCompletedByVehicle delegates', async () => {
    const { svc, dao } = setup();
    await svc.findCompletedByVehicle('v1');
    expect(dao.findCompletedByVehicle).toHaveBeenCalledWith('v1');
  });

  it('admin list forwards only provided filters', async () => {
    const { svc, dao } = setup();
    const res = await svc.list(
      { page: 1, limit: 10, status: MS.SCHEDULED, vehicleId: 'v1' } as any,
      admin,
    );
    expect(dao.findPaginated).toHaveBeenCalledWith(
      { status: MS.SCHEDULED, vehicleId: 'v1' },
      1,
      10,
    );
    expect(res).toMatchObject({ total: 1, page: 1, limit: 10 });
  });

  it('technician list is forced to their own mechanicId', async () => {
    const { svc, dao } = setup();
    await svc.list({ page: 1, limit: 10, mechanicId: 'other' } as any, tech);
    expect(dao.findPaginated).toHaveBeenCalledWith(
      { mechanicId: 'me1' },
      1,
      10,
    );
  });

  it('technician without mechanic profile gets an empty page', async () => {
    const { svc, dao } = setup({
      mechanicDao: { findByUserId: async () => null },
    });
    const res = await svc.list({ page: 1, limit: 10 } as any, tech);
    expect(res).toEqual({ items: [], total: 0, page: 1, limit: 10 });
    expect(dao.findPaginated).not.toHaveBeenCalled();
  });

  it('getById: admin ok, 404 when missing', async () => {
    expect(await setup().svc.getById('mt1', admin)).toMatchObject({
      id: 'mt1',
    });
    const { svc } = setup({ dao: { findById: async () => null } });
    await expect(svc.getById('x', admin)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('getById: technician owner ok, other technician 403', async () => {
    expect(await setup().svc.getById('mt1', tech)).toMatchObject({
      id: 'mt1',
    });
    const { svc } = setup({
      dao: { findById: async () => maint({ mechanicId: 'someone-else' }) },
    });
    await expect(svc.getById('mt1', tech)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('historyByVehicle 404s for unknown vehicles, filters otherwise', async () => {
    const missing = setup({ vehicleDao: { existsById: async () => false } });
    await expect(
      missing.svc.historyByVehicle('x', { page: 1, limit: 10 } as any, admin),
    ).rejects.toBeInstanceOf(NotFoundException);

    const { svc, dao } = setup();
    await svc.historyByVehicle('v1', { page: 1, limit: 10 } as any, admin);
    expect(dao.findPaginated).toHaveBeenCalledWith({ vehicleId: 'v1' }, 1, 10);
  });
});

describe('MaintenancesService.changeStatus', () => {
  const complete = {
    status: MS.COMPLETED,
    workPerformed: 'done',
    finalCost: 50,
    completedAt: new Date('2030-01-02T00:00:00Z'),
    finalMileage: 150,
  } as any;

  it('404 when maintenance is missing', async () => {
    const { svc } = setup({ dao: { findByIdForUpdate: async () => null } });
    await expect(
      svc.changeStatus('x', { status: MS.IN_PROGRESS }, admin),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('403 when a technician does not own the maintenance', async () => {
    const { svc } = setup({
      dao: { findByIdForUpdate: async () => maint({ mechanicId: 'other' }) },
    });
    await expect(
      svc.changeStatus('mt1', { status: MS.IN_PROGRESS }, tech),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('technician owner can change status', async () => {
    const { svc } = setup();
    expect(
      await svc.changeStatus('mt1', { status: MS.IN_PROGRESS }, tech),
    ).toMatchObject({ status: MS.IN_PROGRESS });
  });

  it.each([
    [MS.SCHEDULED, MS.COMPLETED],
    [MS.COMPLETED, MS.IN_PROGRESS],
    [MS.CANCELLED, MS.SCHEDULED],
    [MS.IN_PROGRESS, MS.SCHEDULED],
  ])('409 for invalid transition %s -> %s', async (from, to) => {
    const { svc } = setup({
      dao: { findByIdForUpdate: async () => maint({ status: from }) },
    });
    await expect(
      svc.changeStatus('mt1', { status: to }, admin),
    ).rejects.toThrow('Invalid status transition');
  });

  it('SCHEDULED -> IN_PROGRESS puts the vehicle IN_MAINTENANCE', async () => {
    const { svc, vehicleDao, dao } = setup();
    const res = await svc.changeStatus(
      'mt1',
      { status: MS.IN_PROGRESS },
      admin,
    );
    expect(res!.status).toBe(MS.IN_PROGRESS);
    expect(vehicleDao.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: VehicleStatus.IN_MAINTENANCE }),
      em,
    );
    // relations are stripped before saving
    const saved = dao.update.mock.calls[0][0];
    expect(saved.vehicle).toBeUndefined();
    expect(saved.mechanic).toBeUndefined();
  });

  it('409 when the vehicle is not AVAILABLE at start', async () => {
    const { svc } = setup({
      vehicleDao: {
        findByIdForUpdate: async () =>
          vehicle({ status: VehicleStatus.IN_MAINTENANCE }),
      },
    });
    await expect(
      svc.changeStatus('mt1', { status: MS.IN_PROGRESS }, admin),
    ).rejects.toThrow('is not available');
  });

  it('IN_PROGRESS -> COMPLETED stores closure data, updates mileage, frees vehicle', async () => {
    const { svc, vehicleDao } = setup({
      dao: {
        findByIdForUpdate: async () => maint({ status: MS.IN_PROGRESS }),
      },
      vehicleDao: {
        findByIdForUpdate: async () =>
          vehicle({ status: VehicleStatus.IN_MAINTENANCE }),
      },
    });
    const res = await svc.changeStatus('mt1', complete, admin);
    expect(res).toMatchObject({
      status: MS.COMPLETED,
      workPerformed: 'done',
      finalCost: 50,
      finalMileage: 150,
    });
    expect(vehicleDao.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: VehicleStatus.AVAILABLE,
        currentMileage: 150,
      }),
      em,
    );
  });

  it('completion keeps the higher vehicle mileage', async () => {
    const { svc, vehicleDao } = setup({
      dao: {
        findByIdForUpdate: async () => maint({ status: MS.IN_PROGRESS }),
      },
      vehicleDao: {
        findByIdForUpdate: async () =>
          vehicle({ status: VehicleStatus.INACTIVE, currentMileage: 500 }),
      },
    });
    await svc.changeStatus('mt1', complete, admin);
    expect(vehicleDao.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: VehicleStatus.INACTIVE,
        currentMileage: 500,
      }),
      em,
    );
  });

  it.each([
    ['workPerformed missing', { workPerformed: undefined }],
    ['workPerformed blank', { workPerformed: '  ' }],
    ['finalCost missing', { finalCost: undefined }],
    ['completedAt missing', { completedAt: undefined }],
    ['finalMileage missing', { finalMileage: undefined }],
  ])('400 when completing with %s', async (_n, patch) => {
    const { svc } = setup({
      dao: {
        findByIdForUpdate: async () => maint({ status: MS.IN_PROGRESS }),
      },
    });
    await expect(
      svc.changeStatus('mt1', { ...complete, ...patch }, admin),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('400 when finalMileage is lower than initialMileage', async () => {
    const { svc } = setup({
      dao: {
        findByIdForUpdate: async () => maint({ status: MS.IN_PROGRESS }),
      },
    });
    await expect(
      svc.changeStatus('mt1', { ...complete, finalMileage: 10 }, admin),
    ).rejects.toThrow('finalMileage cannot be lower');
  });

  it('CANCELLED while IN_PROGRESS releases the vehicle', async () => {
    const { svc, vehicleDao } = setup({
      dao: {
        findByIdForUpdate: async () => maint({ status: MS.IN_PROGRESS }),
      },
      vehicleDao: {
        findByIdForUpdate: async () =>
          vehicle({ status: VehicleStatus.IN_MAINTENANCE }),
      },
    });
    await svc.changeStatus('mt1', { status: MS.CANCELLED }, admin);
    expect(vehicleDao.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: VehicleStatus.AVAILABLE }),
      em,
    );
  });

  it('CANCELLED while SCHEDULED leaves the vehicle status alone', async () => {
    const { svc, vehicleDao } = setup();
    await svc.changeStatus('mt1', { status: MS.CANCELLED }, admin);
    expect(vehicleDao.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: VehicleStatus.AVAILABLE }),
      em,
    );
  });

  it('maps DB conflicts raised on save to 409', async () => {
    const { svc } = setup({
      dao: {
        update: async () => {
          throw { code: '23505', constraint: 'uq_mnt_vehicle_active' };
        },
      },
    });
    await expect(
      svc.changeStatus('mt1', { status: MS.CANCELLED }, admin),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
