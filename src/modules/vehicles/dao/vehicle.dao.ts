import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import {
  ACTIVE_MAINTENANCE_STATUSES,
  VehicleStatus,
} from '../../../common/enums/index.js';
import { Maintenance } from '../../maintenances/entities/maintenance.entity.js';
import { Vehicle } from '../entities/vehicle.entity.js';

@Injectable()
export class VehicleDao {
  constructor(
    @InjectRepository(Vehicle) private readonly repository: Repository<Vehicle>,
  ) {}

  async create(data: {
    plate: string;
    brand: string;
    model: string;
    year: number;
    currentMileage: number;
    status: VehicleStatus;
  }): Promise<Vehicle> {
    const vehicle = this.repository.create(data);
    return this.repository.save(vehicle);
  }

  async findById(id: string, manager?: EntityManager): Promise<Vehicle | null> {
    const repository = manager
      ? manager.getRepository(Vehicle)
      : this.repository;
    return repository.findOne({ where: { id } });
  }

  /** Locks the vehicle row (pessimistic_write); must run inside a transaction. */
  async findByIdForUpdate(
    id: string,
    manager: EntityManager,
  ): Promise<Vehicle | null> {
    return manager
      .getRepository(Vehicle)
      .findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
  }

  async findByPlate(plate: string): Promise<Vehicle | null> {
    return this.repository.findOne({ where: { plate } });
  }

  async existsById(id: string): Promise<boolean> {
    return this.repository.existsBy({ id });
  }

  async findPaginated(
    page: number,
    limit: number,
    status?: VehicleStatus,
  ): Promise<[Vehicle[], number]> {
    return this.repository.findAndCount({
      where: status ? { status } : {},
      order: { plate: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async hasActiveMaintenance(
    vehicleId: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    return (manager ?? this.repository.manager)
      .getRepository(Maintenance)
      .createQueryBuilder('m')
      .where('m.vehicle_id = :vehicleId', { vehicleId })
      .andWhere('m.status IN (:...s)', { s: ACTIVE_MAINTENANCE_STATUSES })
      .getExists();
  }

  async update(vehicle: Vehicle, manager?: EntityManager): Promise<Vehicle> {
    const repository = manager
      ? manager.getRepository(Vehicle)
      : this.repository;
    return repository.save(vehicle);
  }
}
