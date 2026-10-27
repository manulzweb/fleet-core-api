import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles, User } from '../../common/decorators/index.js';
import { RoleCode } from '../../common/enums/index.js';
import { UpdateActiveStatusDto } from '../../common/dto/update-active-status.dto.js';
import { CreateWorkshopDto } from './dto/workshop-create.dto.js';
import { UpdateWorkshopDto } from './dto/workshop-update.dto.js';
import { WorkshopQueryDto } from './dto/workshop-query.dto.js';
import { WorkshopsService } from './workshops.service.js';

@ApiTags('workshops')
@ApiBearerAuth()
@Controller('workshops')
export class WorkshopsController {
  constructor(private readonly workshops: WorkshopsService) {}

  @Roles(RoleCode.ADMIN)
  @Post()
  create(@Body() dto: CreateWorkshopDto) {
    return this.workshops.create(dto);
  }

  @Get()
  list(@Query() q: WorkshopQueryDto, @User('role') role: RoleCode) {
    return this.workshops.list(q, role);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.workshops.getById(id);
  }

  @Roles(RoleCode.ADMIN)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateWorkshopDto) {
    return this.workshops.update(id, dto);
  }

  @Roles(RoleCode.ADMIN)
  @Patch(':id/status')
  status(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateActiveStatusDto) {
    return this.workshops.setActive(id, dto.isActive);
  }
}
