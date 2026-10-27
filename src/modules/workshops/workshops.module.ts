import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkshopDao } from './dao/workshop.dao.js';
import { Workshop } from './entities/workshop.entity.js';
import { WorkshopsController } from './workshops.controller.js';
import { WorkshopsService } from './workshops.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Workshop])],
  controllers: [WorkshopsController],
  providers: [WorkshopsService, WorkshopDao],
  exports: [WorkshopsService, WorkshopDao],
})
export class WorkshopsModule {}
