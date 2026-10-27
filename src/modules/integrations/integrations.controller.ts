// src/modules/integrations/integrations.controller.ts
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/index.js';
import { VehicleStatus } from '../../common/enums/index.js';
import { ApiKeyGuard } from '../../common/guards/api-key.guard.js';
import { MaintenanceMapper } from '../maintenances/mapper/maintenance.mapper.js';
import { MaintenancesService } from '../maintenances/maintenances.service.js';
import { VehiclesService } from '../vehicles/vehicles.service.js';

/** Machine-to-machine endpoints for external systems; public routes protected by the `x-api-key` header. */
@ApiTags('integrations')
@ApiHeader({ name: 'x-api-key', required: true })
@Public()
@UseGuards(ApiKeyGuard)
@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly vehicles: VehiclesService,
    private readonly maintenances: MaintenancesService,
  ) {}

  /** Returns a vehicle's completed maintenance history, looked up by plate (API key required; 404 if the plate is unknown). */
  @Get('vehicles/:plate/maintenance-history')
  async history(@Param('plate') plate: string) {
    const v = await this.vehicles.getByPlateEntity(plate);
    const items = await this.maintenances.findCompletedByVehicle(v.id);
    return {
      vehicle: {
        id: v.id,
        plate: v.plate,
        brand: v.brand,
        model: v.model,
        available: v.status === VehicleStatus.AVAILABLE,
      },
      maintenances: items.map(MaintenanceMapper.toHistoryItem),
    };
  }
}
