import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleDao } from './dao/vehicle.dao.js';
import { Vehicle } from './entities/vehicle.entity.js';
import { VehiclesController } from './vehicles.controller.js';
import { VehiclesService } from './vehicles.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle])],
  controllers: [VehiclesController],
  providers: [VehiclesService, VehicleDao],
  exports: [VehiclesService, VehicleDao],
})
export class VehiclesModule {}
