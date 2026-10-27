// src/modules/workshops/workshops.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkshopDao } from './dao/workshop.dao.js';
import { Workshop } from './entities/workshop.entity.js';
import { WorkshopsController } from './workshops.controller.js';
import { WorkshopsService } from './workshops.service.js';

/**
 * Workshops feature module; exports the service and DAO for use by maintenances.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Workshop])],
  controllers: [WorkshopsController],
  providers: [WorkshopsService, WorkshopDao],
  exports: [WorkshopsService, WorkshopDao],
})
export class WorkshopsModule {}
