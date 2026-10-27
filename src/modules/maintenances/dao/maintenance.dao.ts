import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ACTIVE_MAINTENANCE_STATUSES, MaintenanceStatus, MaintenanceType } from '../../../common/enums/index.js';
import { Maintenance } from '../entities/maintenance.entity.js';

export interface MaintenanceFilter {
  vehicleId?: string;
  mechanicId?: string;
  status?: MaintenanceStatus;
}

const RELATIONS = { vehicle: true, mechanic: true, workshop: true } as const;

@Injectable()
export class MaintenanceDao {
  constructor(@InjectRepository(Maintenance) private readonly repository: Repository<Maintenance>) {}

  async create(
    data: {
      type: MaintenanceType;
      description: string;
      initialMileage: number;
      scheduledStartAt: Date;
      scheduledEndAt: Date;
      vehicleId: string;
      mechanicId: string;
      workshopId: string;
      status: MaintenanceStatus;
    },
    manager: EntityManager,
  ): Promise<Maintenance> {
    const repository = manager.getRepository(Maintenance);
    const maintenance = repository.create({
      ...data,
      workPerformed: null,
      finalCost: null,
      completedAt: null,
      finalMileage: null,
    });
    return repository.save(maintenance);
  }

  async findById(id: string, manager?: EntityManager): Promise<Maintenance | null> {
    const repository = manager ? manager.getRepository(Maintenance) : this.repository;
    return repository.findOne({ where: { id }, relations: RELATIONS });
  }

  /** Locks the maintenance row (pessimistic_write), then loads it with relations; run inside a transaction. */
  async findByIdForUpdate(id: string, manager: EntityManager): Promise<Maintenance | null> {
    const repository = manager.getRepository(Maintenance);
    // Lock only the maintenance row; relations are loaded separately.
    const locked = await repository.findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
    if (!locked) return null;
    return repository.findOne({ where: { id }, relations: RELATIONS });
  }

  async findPaginated(filter: MaintenanceFilter, page: number, limit: number): Promise<[Maintenance[], number]> {
    return this.repository.findAndCount({
      where: filter,
      relations: RELATIONS,
      order: { scheduledStartAt: 'DESC', id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findCompletedByVehicle(vehicleId: string): Promise<Maintenance[]> {
    return this.repository.find({
      where: { vehicleId, status: MaintenanceStatus.COMPLETED },
      relations: { mechanic: true, workshop: true },
      order: { completedAt: 'DESC', id: 'DESC' },
    });
  }

  async mechanicHasOverlap(mechanicId: string, start: Date, end: Date, manager: EntityManager): Promise<boolean> {
    return manager
      .getRepository(Maintenance)
      .createQueryBuilder('m')
      .where('m.mechanic_id = :mechanicId', { mechanicId })
      .andWhere('m.status IN (:...s)', { s: ACTIVE_MAINTENANCE_STATUSES })
      .andWhere('m.scheduled_start_at < :end AND m.scheduled_end_at > :start', { start, end })
      .getExists();
  }

  async update(maintenance: Maintenance, manager: EntityManager): Promise<Maintenance> {
    return manager.getRepository(Maintenance).save(maintenance);
  }
}
