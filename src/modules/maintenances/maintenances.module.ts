import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceDao } from './dao/maintenance.dao.js';
import { Maintenance } from './entities/maintenance.entity.js';
import { MechanicsModule } from '../mechanics/mechanics.module.js';
import { VehiclesModule } from '../vehicles/vehicles.module.js';
import { WorkshopsModule } from '../workshops/workshops.module.js';
import { MaintenancesController } from './maintenances.controller.js';
import { MaintenancesService } from './maintenances.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Maintenance]),
    VehiclesModule,
    MechanicsModule,
    WorkshopsModule,
  ],
  controllers: [MaintenancesController],
  providers: [MaintenancesService, MaintenanceDao],
  exports: [MaintenancesService],
})
export class MaintenancesModule {}
