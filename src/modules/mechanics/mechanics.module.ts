// src/modules/mechanics/mechanics.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module.js';
import { MechanicDao } from './dao/mechanic.dao.js';
import { Mechanic } from './entities/mechanic.entity.js';
import { MechanicsController } from './mechanics.controller.js';
import { MechanicsService } from './mechanics.service.js';

/**
 * Mechanics feature module; exports the service and DAO for use by maintenances.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Mechanic]), UsersModule],
  controllers: [MechanicsController],
  providers: [MechanicsService, MechanicDao],
  exports: [MechanicsService, MechanicDao],
})
export class MechanicsModule {}
