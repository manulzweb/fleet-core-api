import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { VehicleStatus } from '../../common/enums/index.js';
import { Vehicle } from './entities/vehicle.entity.js';
import { VehiclesService } from './vehicles.service.js';

const vehicle = (o: Partial<Vehicle> = {}) =>
  Object.assign(
    new Vehicle(),
    {
      id: 'v1',
      plate: 'ABC123',
      brand: 'B',
      model: 'M',
      year: 2024,
      currentMileage: 100,
      status: VehicleStatus.AVAILABLE,
    },
    o,
  );

const make = (dao: Record<string, any>) => new VehiclesService(dao as any);

describe('VehiclesService', () => {
  it('rejects duplicate plates with 409', async () => {
    const svc = make({ findByPlate: async () => vehicle() });
    await expect(
      svc.create({
        plate: 'ABC123',
        brand: 'B',
        model: 'M',
        year: 2024,
        currentMileage: 0,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('creates AVAILABLE vehicles', async () => {
    const svc = make({
      findByPlate: async () => null,
      create: async (v: Vehicle) => v,
    });
    const res = await svc.create({
      plate: 'NEW123',
      brand: 'B',
      model: 'M',
      year: 2024,
      currentMileage: 0,
    });
    expect(res).toMatchObject({ plate: 'NEW123', status: 'AVAILABLE' });
  });

  it('404 when missing; mileage cannot decrease', async () => {
    await expect(
      make({ findById: async () => null }).getById('x'),
    ).rejects.toBeInstanceOf(NotFoundException);
    const svc = make({
      findById: async () => vehicle(),
      findByPlate: async () => null,
    });
    await expect(
      svc.update('v1', { currentMileage: 5 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('cannot change status while maintenance is active', async () => {
    const svc = make({
      findById: async () => vehicle(),
      hasActiveMaintenance: async () => true,
    });
    await expect(
      svc.changeStatus('v1', VehicleStatus.INACTIVE),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('changes status when no maintenance is active; no-op when unchanged', async () => {
    const update = vi.fn(async (v: Vehicle) => v);
    const svc = make({
      findById: async () => vehicle(),
      hasActiveMaintenance: async () => false,
      update,
    });
    expect(await svc.changeStatus('v1', VehicleStatus.INACTIVE)).toMatchObject({
      status: 'INACTIVE',
    });
    await svc.changeStatus('v1', VehicleStatus.AVAILABLE);
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('maps a DB plate conflict on create to 409', async () => {
    const svc = make({
      findByPlate: async () => null,
      create: async () => {
        throw { code: '23505', constraint: 'vehicles_plate_key' };
      },
    });
    await expect(
      svc.create({
        plate: 'X',
        brand: 'B',
        model: 'M',
        year: 2024,
        currentMileage: 0,
      }),
    ).rejects.toThrow('A vehicle with this plate already exists');
  });

  it('list paginates with the status filter', async () => {
    const findPaginated = vi.fn(async () => [[vehicle()], 1]);
    const res = await make({ findPaginated }).list({
      page: 1,
      limit: 5,
      status: VehicleStatus.AVAILABLE,
    } as any);
    expect(findPaginated).toHaveBeenCalledWith(1, 5, VehicleStatus.AVAILABLE);
    expect(res).toMatchObject({ total: 1, limit: 5 });
  });

  it('getById and getByPlate (normalized) return or 404', async () => {
    const findByPlate = vi.fn(async (p: string) =>
      p === 'ABC123' ? vehicle() : null,
    );
    const svc = make({ findById: async () => vehicle(), findByPlate });
    expect(await svc.getById('v1')).toMatchObject({ id: 'v1' });
    expect(await svc.getByPlate(' abc-123 ')).toMatchObject({
      plate: 'ABC123',
    });
    await expect(svc.getByPlate('zzz999')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  describe('update', () => {
    it('409 when changing to a plate used by another vehicle', async () => {
      const svc = make({
        findById: async () => vehicle(),
        findByPlate: async () => vehicle({ id: 'other' }),
      });
      await expect(
        svc.update('v1', { plate: 'NEW999' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('updates fields and allows mileage increase', async () => {
      const svc = make({
        findById: async () => vehicle(),
        findByPlate: async () => null,
        update: async (v: Vehicle) => v,
      });
      expect(
        await svc.update('v1', { plate: 'NEW999', currentMileage: 200 }),
      ).toMatchObject({ plate: 'NEW999', currentMileage: 200 });
    });

    it('maps a DB plate conflict on save', async () => {
      const svc = make({
        findById: async () => vehicle(),
        update: async () => {
          throw { code: '23505', constraint: 'vehicles_plate_key' };
        },
      });
      await expect(svc.update('v1', { brand: 'X' })).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });
});
