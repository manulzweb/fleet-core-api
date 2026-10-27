// src/modules/vehicles/vehicles.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleDao } from './dao/vehicle.dao.js';
import { Vehicle } from './entities/vehicle.entity.js';
import { VehiclesController } from './vehicles.controller.js';
import { VehiclesService } from './vehicles.service.js';

/** Vehicle persistence and endpoints; exports the service and DAO for the maintenances module. */
@Module({
  imports: [TypeOrmModule.forFeature([Vehicle])],
  controllers: [VehiclesController],
  providers: [VehiclesService, VehicleDao],
  exports: [VehiclesService, VehicleDao],
})
export class VehiclesModule {}
