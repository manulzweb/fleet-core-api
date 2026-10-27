// src/modules/workshops/workshops.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles, User } from '../../common/decorators/index.js';
import { RoleCode } from '../../common/enums/index.js';
import { UpdateActiveStatusDto } from '../../common/dto/update-active-status.dto.js';
import { CreateWorkshopDto } from './dto/workshop-create.dto.js';
import { UpdateWorkshopDto } from './dto/workshop-update.dto.js';
import { WorkshopQueryDto } from './dto/workshop-query.dto.js';
import { WorkshopsService } from './workshops.service.js';

/**
 * Workshops CRUD. Reads are open to any authenticated role; writes are ADMIN only.
 */
@ApiTags('workshops')
@ApiBearerAuth()
@Controller('workshops')
export class WorkshopsController {
  constructor(private readonly workshops: WorkshopsService) {}

  /** Creates a workshop (ADMIN only). */
  @Roles(RoleCode.ADMIN)
  @Post()
  create(@Body() dto: CreateWorkshopDto) {
    return this.workshops.create(dto);
  }

  /**
   * Lists workshops; non-ADMIN callers only see active ones, ADMIN may pass `includeInactive`.
   */
  @Get()
  list(@Query() q: WorkshopQueryDto, @User('role') role: RoleCode) {
    return this.workshops.list(q, role);
  }

  /** Gets a workshop by id. 404 if not found. */
  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.workshops.getById(id);
  }

  /** Updates a workshop (ADMIN only). 404 if not found. */
  @Roles(RoleCode.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWorkshopDto,
  ) {
    return this.workshops.update(id, dto);
  }

  /** Activates or deactivates a workshop (ADMIN only). */
  @Roles(RoleCode.ADMIN)
  @Patch(':id/status')
  status(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateActiveStatusDto,
  ) {
    return this.workshops.setActive(id, dto.isActive);
  }
}
