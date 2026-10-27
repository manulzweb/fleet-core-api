import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { type AuthUser, Roles, User } from '../../common/decorators/index.js';
import { RoleCode } from '../../common/enums/index.js';
import { CreateMaintenanceDto } from './dto/maintenance-create.dto.js';
import { MaintenanceQueryDto } from './dto/maintenance-query.dto.js';
import { UpdateMaintenanceStatusDto } from './dto/maintenance-update-status.dto.js';
import { MaintenancesService } from './maintenances.service.js';

@ApiTags('maintenances')
@ApiBearerAuth()
@Controller()
export class MaintenancesController {
  constructor(private readonly maintenances: MaintenancesService) {}

  @Roles(RoleCode.ADMIN)
  @Post('maintenances')
  create(@Body() dto: CreateMaintenanceDto) {
    return this.maintenances.create(dto);
  }

  @Get('maintenances')
  list(@Query() q: MaintenanceQueryDto, @User() user: AuthUser) {
    return this.maintenances.list(q, user);
  }

  @Get('maintenances/:id')
  get(@Param('id', ParseUUIDPipe) id: string, @User() user: AuthUser) {
    return this.maintenances.getById(id, user);
  }

  @Patch('maintenances/:id/status')
  status(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMaintenanceStatusDto,
    @User() user: AuthUser,
  ) {
    return this.maintenances.changeStatus(id, dto, user);
  }

  @Get('vehicles/:vehicleId/maintenances')
  history(
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
    @Query() q: MaintenanceQueryDto,
    @User() user: AuthUser,
  ) {
    return this.maintenances.historyByVehicle(vehicleId, q, user);
  }
}
