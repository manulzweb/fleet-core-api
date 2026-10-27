import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { type AuthUser } from '../../common/decorators/index.js';
import { toPage } from '../../common/dto/page.js';
import {
  MaintenanceStatus,
  RoleCode,
  VehicleStatus,
} from '../../common/enums/index.js';
import { rethrowDbConflict } from '../../common/utils/db-errors.js';
import { MechanicDao } from '../mechanics/dao/mechanic.dao.js';
import { VehicleDao } from '../vehicles/dao/vehicle.dao.js';
import { WorkshopDao } from '../workshops/dao/workshop.dao.js';
import { CreateMaintenanceDto } from './dto/maintenance-create.dto.js';
import { MaintenanceQueryDto } from './dto/maintenance-query.dto.js';
import { UpdateMaintenanceStatusDto } from './dto/maintenance-update-status.dto.js';
import {
  MaintenanceDao,
  type MaintenanceFilter,
} from './dao/maintenance.dao.js';
import { Maintenance } from './entities/maintenance.entity.js';
import { MaintenanceMapper } from './mapper/maintenance.mapper.js';
import { canTransition } from './maintenance-transitions.js';

const DB_CONFLICTS = {
  uq_mnt_vehicle_active: 'The vehicle already has active maintenance',
  excl_mnt_mechanic_overlap:
    'The mechanic has an overlapping maintenance schedule',
};

@Injectable()
export class MaintenancesService {
  constructor(
    @InjectDataSource() private readonly ds: DataSource,
    private readonly dao: MaintenanceDao,
    private readonly vehicleDao: VehicleDao,
    private readonly mechanicDao: MechanicDao,
    private readonly workshopDao: WorkshopDao,
  ) {}

  async create(dto: CreateMaintenanceDto) {
    if (dto.scheduledEndAt <= dto.scheduledStartAt) {
      throw new BadRequestException(
        'scheduledEndAt must be later than scheduledStartAt',
      );
    }
    try {
      return await this.ds.transaction(async (em) => {
        // Row lock serializes concurrent assignments for the same vehicle.
        const vehicle = await this.vehicleDao.findByIdForUpdate(
          dto.vehicleId,
          em,
        );
        if (!vehicle) throw new NotFoundException('Vehicle not found');
        const mechanic = await this.mechanicDao.findById(dto.mechanicId, em);
        if (!mechanic) throw new NotFoundException('Mechanic not found');
        const workshop = await this.workshopDao.findById(dto.workshopId, em);
        if (!workshop) throw new NotFoundException('Workshop not found');

        if (vehicle.status === VehicleStatus.INACTIVE) {
          throw new ConflictException(
            `The vehicle ${vehicle.plate} is inactive`,
          );
        }
        if (!mechanic.isActive)
          throw new ConflictException('The mechanic is inactive');
        if (!workshop.isActive)
          throw new ConflictException('The workshop is inactive');
        if (dto.initialMileage < vehicle.currentMileage) {
          throw new BadRequestException(
            `initialMileage cannot be lower than the vehicle's current mileage (${vehicle.currentMileage})`,
          );
        }
        if (await this.vehicleDao.hasActiveMaintenance(vehicle.id, em)) {
          throw new ConflictException(
            `The vehicle ${vehicle.plate} already has active maintenance`,
          );
        }
        if (
          await this.dao.mechanicHasOverlap(
            mechanic.id,
            dto.scheduledStartAt,
            dto.scheduledEndAt,
            em,
          )
        ) {
          throw new ConflictException(
            'The mechanic has an overlapping maintenance schedule',
          );
        }

        const m = await this.dao.create(
          { ...dto, status: MaintenanceStatus.SCHEDULED },
          em,
        );
        return MaintenanceMapper.toResponse(m);
      });
    } catch (e) {
      rethrowDbConflict(e, DB_CONFLICTS);
    }
  }

  findCompletedByVehicle(vehicleId: string): Promise<Maintenance[]> {
    return this.dao.findCompletedByVehicle(vehicleId);
  }

  private async mechanicIdOf(user: AuthUser) {
    const mech = await this.mechanicDao.findByUserId(user.id);
    return mech?.id ?? null;
  }

  async list(q: MaintenanceQueryDto, user: AuthUser) {
    const filter: MaintenanceFilter = {};
    if (q.vehicleId !== undefined) filter.vehicleId = q.vehicleId;
    if (q.mechanicId !== undefined) filter.mechanicId = q.mechanicId;
    if (q.status !== undefined) filter.status = q.status;
    if (user.role === RoleCode.TECHNICIAN) {
      const own = await this.mechanicIdOf(user);
      if (!own) return toPage([[], 0], q, MaintenanceMapper.toResponse);
      filter.mechanicId = own;
    }
    return toPage(
      await this.dao.findPaginated(filter, q.page, q.limit),
      q,
      MaintenanceMapper.toResponse,
    );
  }

  async getById(id: string, user: AuthUser) {
    const m = await this.dao.findById(id);
    if (!m) throw new NotFoundException('Maintenance not found');
    await this.assertAccess(m, user);
    return MaintenanceMapper.toResponse(m);
  }

  private async assertAccess(m: Maintenance, user: AuthUser) {
    if (user.role === RoleCode.ADMIN) return;
    if ((await this.mechanicIdOf(user)) !== m.mechanicId) {
      throw new ForbiddenException(
        'You can only access maintenance assigned to you',
      );
    }
  }

  async historyByVehicle(
    vehicleId: string,
    q: MaintenanceQueryDto,
    user: AuthUser,
  ) {
    if (!(await this.vehicleDao.existsById(vehicleId))) {
      throw new NotFoundException('Vehicle not found');
    }
    return this.list({ ...q, vehicleId }, user);
  }

  async changeStatus(
    id: string,
    dto: UpdateMaintenanceStatusDto,
    user: AuthUser,
  ) {
    try {
      return await this.ds.transaction(async (em) => {
        const m = await this.dao.findByIdForUpdate(id, em);
        if (!m) throw new NotFoundException('Maintenance not found');
        await this.assertAccess(m, user);

        if (!canTransition(m.status, dto.status)) {
          throw new ConflictException(
            `Invalid status transition ${m.status} -> ${dto.status}`,
          );
        }
        const vehicle = (await this.vehicleDao.findByIdForUpdate(
          m.vehicleId,
          em,
        ))!;

        if (dto.status === MaintenanceStatus.IN_PROGRESS) {
          if (vehicle.status !== VehicleStatus.AVAILABLE) {
            throw new ConflictException(
              `The vehicle ${vehicle.plate} is not available`,
            );
          }
          vehicle.status = VehicleStatus.IN_MAINTENANCE;
        } else if (dto.status === MaintenanceStatus.COMPLETED) {
          const { workPerformed, finalCost, completedAt, finalMileage } = dto;
          if (
            !workPerformed?.trim() ||
            finalCost === undefined ||
            !completedAt ||
            finalMileage === undefined
          ) {
            throw new BadRequestException(
              'workPerformed, finalCost, completedAt and finalMileage are required to complete a maintenance',
            );
          }
          if (finalMileage < m.initialMileage) {
            throw new BadRequestException(
              'finalMileage cannot be lower than initialMileage',
            );
          }
          Object.assign(m, {
            workPerformed,
            finalCost,
            completedAt,
            finalMileage,
          });
          vehicle.currentMileage = Math.max(
            vehicle.currentMileage,
            finalMileage,
          );
          if (vehicle.status === VehicleStatus.IN_MAINTENANCE)
            vehicle.status = VehicleStatus.AVAILABLE;
        } else if (vehicle.status === VehicleStatus.IN_MAINTENANCE) {
          // CANCELLED while IN_PROGRESS releases the vehicle.
          vehicle.status = VehicleStatus.AVAILABLE;
        }

        m.status = dto.status;
        const { vehicle: _v, mechanic: _m, workshop: _w, ...plain } = m;
        await this.vehicleDao.update(vehicle, em);
        return MaintenanceMapper.toResponse(
          await this.dao.update(Object.assign(new Maintenance(), plain), em),
        );
      });
    } catch (e) {
      rethrowDbConflict(e, DB_CONFLICTS);
    }
  }
}
