// src/modules/integrations/integrations.module.ts
import { Module } from '@nestjs/common';
import { MaintenancesModule } from '../maintenances/maintenances.module.js';
import { VehiclesModule } from '../vehicles/vehicles.module.js';
import { IntegrationsController } from './integrations.controller.js';

/** Exposes external integration endpoints built on top of the vehicles and maintenances modules. */
@Module({
  imports: [VehiclesModule, MaintenancesModule],
  controllers: [IntegrationsController],
})
export class IntegrationsModule {}
