// src/modules/vehicles/vehicles.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { toPage } from '../../common/dto/page.js';
import { VehicleStatus } from '../../common/enums/index.js';
import { rethrowDbConflict } from '../../common/utils/db-errors.js';
import { normalizePlate } from '../../common/utils/normalize-plate.js';
import { CreateVehicleDto } from './dto/vehicle-create.dto.js';
import { UpdateVehicleDto } from './dto/vehicle-update.dto.js';
import { VehicleQueryDto } from './dto/vehicle-query.dto.js';
import { VehicleDao } from './dao/vehicle.dao.js';
import { VehicleMapper } from './mapper/vehicle.mapper.js';

const PLATE_CONFLICT = {
  vehicles_plate_key: 'A vehicle with this plate already exists',
};

/** Vehicle business rules: plate uniqueness, non-decreasing mileage and status changes. */
@Injectable()
export class VehiclesService {
  constructor(private readonly dao: VehicleDao) {}

  /**
   * Creates a vehicle with status AVAILABLE.
   * @throws ConflictException if the plate already exists.
   */
  async create(dto: CreateVehicleDto) {
    if (await this.dao.findByPlate(dto.plate)) {
      throw new ConflictException(
        `A vehicle with plate ${dto.plate} already exists`,
      );
    }
    try {
      const v = await this.dao.create({
        ...dto,
        status: VehicleStatus.AVAILABLE,
      });
      return VehicleMapper.toResponse(v);
    } catch (e) {
      rethrowDbConflict(e, PLATE_CONFLICT);
    }
  }

  /** Returns a page of vehicles, optionally filtered by status. */
  async list(q: VehicleQueryDto) {
    return toPage(
      await this.dao.findPaginated(q.page, q.limit, q.status),
      q,
      VehicleMapper.toResponse,
    );
  }

  /**
   * Loads a vehicle entity by id.
   * @throws NotFoundException if it does not exist.
   */
  async getEntity(id: string) {
    const v = await this.dao.findById(id);
    if (!v) throw new NotFoundException('Vehicle not found');
    return v;
  }

  /**
   * Returns a vehicle as a response DTO.
   * @throws NotFoundException if it does not exist.
   */
  async getById(id: string) {
    return VehicleMapper.toResponse(await this.getEntity(id));
  }

  /**
   * Loads a vehicle entity by plate; the plate is normalized first.
   * @throws NotFoundException if it does not exist.
   */
  async getByPlateEntity(plate: string) {
    const v = await this.dao.findByPlate(normalizePlate(plate));
    if (!v) throw new NotFoundException('Vehicle not found');
    return v;
  }

  /**
   * Returns a vehicle as a response DTO, looked up by plate.
   * @throws NotFoundException if it does not exist.
   */
  async getByPlate(plate: string) {
    return VehicleMapper.toResponse(await this.getByPlateEntity(plate));
  }

  /**
   * Applies a partial update to a vehicle.
   * @throws ConflictException if the new plate is taken.
   * @throws BadRequestException if the mileage would decrease.
   */
  async update(id: string, dto: UpdateVehicleDto) {
    const v = await this.getEntity(id);
    if (
      dto.plate &&
      dto.plate !== v.plate &&
      (await this.dao.findByPlate(dto.plate))
    ) {
      throw new ConflictException(
        `A vehicle with plate ${dto.plate} already exists`,
      );
    }
    if (
      dto.currentMileage !== undefined &&
      dto.currentMileage < v.currentMileage
    ) {
      throw new BadRequestException('Vehicle mileage cannot decrease');
    }
    Object.assign(v, dto);
    try {
      return VehicleMapper.toResponse(await this.dao.update(v));
    } catch (e) {
      rethrowDbConflict(e, PLATE_CONFLICT);
    }
  }

  /**
   * Sets the vehicle status; a no-op if unchanged.
   * @throws ConflictException if the vehicle has active maintenance.
   */
  async changeStatus(id: string, status: VehicleStatus) {
    const v = await this.getEntity(id);
    if (v.status === status) return VehicleMapper.toResponse(v);
    if (await this.dao.hasActiveMaintenance(id)) {
      throw new ConflictException(
        'Vehicle status cannot be changed while it has active maintenance',
      );
    }
    v.status = status;
    return VehicleMapper.toResponse(await this.dao.update(v));
  }
}
