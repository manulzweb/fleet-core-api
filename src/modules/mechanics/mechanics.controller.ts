// src/modules/mechanics/mechanics.controller.ts
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
import { Roles } from '../../common/decorators/index.js';
import { RoleCode } from '../../common/enums/index.js';
import { UpdateActiveStatusDto } from '../../common/dto/update-active-status.dto.js';
import { CreateMechanicDto } from './dto/mechanic-create.dto.js';
import { MechanicQueryDto } from './dto/mechanic-query.dto.js';
import { UpdateMechanicDto } from './dto/mechanic-update.dto.js';
import { MechanicsService } from './mechanics.service.js';

/**
 * Mechanics CRUD. Reads are open to any authenticated role; writes are ADMIN only.
 */
@ApiTags('mechanics')
@ApiBearerAuth()
@Controller('mechanics')
export class MechanicsController {
  constructor(private readonly mechanics: MechanicsService) {}

  /**
   * Creates a mechanic (ADMIN only). 409 on duplicate email or already-linked user.
   */
  @Roles(RoleCode.ADMIN)
  @Post()
  create(@Body() dto: CreateMechanicDto) {
    return this.mechanics.create(dto);
  }

  /** Lists mechanics, paginated, optionally filtered by `isActive`. */
  @Get()
  list(@Query() q: MechanicQueryDto) {
    return this.mechanics.list(q);
  }

  /** Gets a mechanic by id. 404 if not found. */
  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.mechanics.getById(id);
  }

  @Roles(RoleCode.ADMIN)
  /**
   * Updates a mechanic (ADMIN only). 404 if missing, 409 on duplicate email or user.
   */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMechanicDto,
  ) {
    return this.mechanics.update(id, dto);
  }

  @Roles(RoleCode.ADMIN)
  /** Activates or deactivates a mechanic (ADMIN only). */
  @Patch(':id/status')
  status(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateActiveStatusDto,
  ) {
    return this.mechanics.setActive(id, dto.isActive);
  }
}
