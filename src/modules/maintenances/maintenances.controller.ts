// src/modules/maintenances/maintenances.controller.ts
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
import { type AuthUser, Roles, User } from '../../common/decorators/index.js';
import { RoleCode } from '../../common/enums/index.js';
import { CreateMaintenanceDto } from './dto/maintenance-create.dto.js';
import { MaintenanceQueryDto } from './dto/maintenance-query.dto.js';
import { UpdateMaintenanceStatusDto } from './dto/maintenance-update-status.dto.js';
import { MaintenancesService } from './maintenances.service.js';

/**
 * Maintenance scheduling and lifecycle, plus the per-vehicle history route.
 * TECHNICIAN callers are restricted to maintenances assigned to their own mechanic record.
 */
@ApiTags('maintenances')
@ApiBearerAuth()
@Controller()
export class MaintenancesController {
  constructor(private readonly maintenances: MaintenancesService) {}

  /**
   * Schedules a maintenance (ADMIN only). 400 on invalid dates or mileage, 404 on unknown vehicle/mechanic/workshop, 409 on inactive resources, active maintenance or mechanic overlap.
   */
  @Roles(RoleCode.ADMIN)
  @Post('maintenances')
  create(@Body() dto: CreateMaintenanceDto) {
    return this.maintenances.create(dto);
  }

  /**
   * Lists maintenances; ADMIN sees all (with optional filters), TECHNICIAN only their own.
   */
  @Get('maintenances')
  list(@Query() q: MaintenanceQueryDto, @User() user: AuthUser) {
    return this.maintenances.list(q, user);
  }

  /**
   * Gets a maintenance. 404 if missing, 403 if a TECHNICIAN does not own it.
   */
  @Get('maintenances/:id')
  get(@Param('id', ParseUUIDPipe) id: string, @User() user: AuthUser) {
    return this.maintenances.getById(id, user);
  }

  /**
   * Transitions a maintenance status (ADMIN, or the assigned TECHNICIAN). 403 if not owner, 409 on invalid transition or unavailable vehicle, 400 if completion data is missing.
   */
  @Patch('maintenances/:id/status')
  status(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMaintenanceStatusDto,
    @User() user: AuthUser,
  ) {
    return this.maintenances.changeStatus(id, dto, user);
  }

  /**
   * Maintenance history of a vehicle (same visibility rules as the list). 404 if the vehicle does not exist.
   */
  @Get('vehicles/:vehicleId/maintenances')
  history(
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
    @Query() q: MaintenanceQueryDto,
    @User() user: AuthUser,
  ) {
    return this.maintenances.historyByVehicle(vehicleId, q, user);
  }
}
