import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { VehicleStatus } from '../../common/enums/index.js';
import { Vehicle } from './entities/vehicle.entity.js';
import { VehiclesService } from './vehicles.service.js';

const vehicle = (o: Partial<Vehicle> = {}) =>
  Object.assign(new Vehicle(), { id: 'v1', plate: 'ABC123', brand: 'B', model: 'M', year: 2024, currentMileage: 100, status: VehicleStatus.AVAILABLE }, o);

const make = (dao: Record<string, any>) => new VehiclesService(dao as any);

describe('VehiclesService', () => {
  it('rejects duplicate plates with 409', async () => {
    const svc = make({ findByPlate: async () => vehicle() });
    await expect(svc.create({ plate: 'ABC123', brand: 'B', model: 'M', year: 2024, currentMileage: 0 })).rejects.toBeInstanceOf(ConflictException);
  });

  it('creates AVAILABLE vehicles', async () => {
    const svc = make({ findByPlate: async () => null, create: async (v: Vehicle) => v });
    const res = await svc.create({ plate: 'NEW123', brand: 'B', model: 'M', year: 2024, currentMileage: 0 });
    expect(res).toMatchObject({ plate: 'NEW123', status: 'AVAILABLE' });
  });

  it('404 when missing; mileage cannot decrease', async () => {
    await expect(make({ findById: async () => null }).getById('x')).rejects.toBeInstanceOf(NotFoundException);
    const svc = make({ findById: async () => vehicle(), findByPlate: async () => null });
    await expect(svc.update('v1', { currentMileage: 5 })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('cannot change status while maintenance is active', async () => {
    const svc = make({ findById: async () => vehicle(), hasActiveMaintenance: async () => true });
    await expect(svc.changeStatus('v1', VehicleStatus.INACTIVE)).rejects.toBeInstanceOf(ConflictException);
  });
});
