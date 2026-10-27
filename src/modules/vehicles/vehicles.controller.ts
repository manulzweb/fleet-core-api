// src/modules/vehicles/vehicles.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/index.js';
import { RoleCode } from '../../common/enums/index.js';
import { CreateVehicleDto } from './dto/vehicle-create.dto.js';
import { UpdateVehicleDto } from './dto/vehicle-update.dto.js';
import { UpdateVehicleStatusDto } from './dto/vehicle-update-status.dto.js';
import { VehicleQueryDto } from './dto/vehicle-query.dto.js';
import { VehiclesService } from './vehicles.service.js';

/** Vehicle fleet endpoints. Reads are open to any authenticated user; writes are ADMIN only. */
@ApiTags('vehicles')
@ApiBearerAuth()
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehicles: VehiclesService) {}

  /** Registers a new vehicle as AVAILABLE (ADMIN only; 409 on duplicate plate). */
  @Roles(RoleCode.ADMIN)
  @Post()
  create(@Body() dto: CreateVehicleDto) {
    return this.vehicles.create(dto);
  }

  /** Lists vehicles, paginated and optionally filtered by status. */
  @Get()
  list(@Query() q: VehicleQueryDto) {
    return this.vehicles.list(q);
  }

  /** Gets a vehicle by plate (case/format-insensitive). */
  @Get('plate/:plate')
  byPlate(@Param('plate') plate: string) {
    return this.vehicles.getByPlate(plate);
  }

  /** Gets a vehicle by id. */
  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehicles.getById(id);
  }

  /** Updates vehicle data (ADMIN only; 409 on duplicate plate, 400 if mileage decreases). */
  @Roles(RoleCode.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehicles.update(id, dto);
  }

  /** Toggles a vehicle between AVAILABLE and INACTIVE (ADMIN only; 409 while it has active maintenance). */
  @Roles(RoleCode.ADMIN)
  @Patch(':id/status')
  status(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVehicleStatusDto,
  ) {
    return this.vehicles.changeStatus(id, dto.status);
  }
}
