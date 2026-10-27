import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/index.js';
import { RoleCode } from '../../common/enums/index.js';
import { UpdateActiveStatusDto } from '../../common/dto/update-active-status.dto.js';
import { CreateMechanicDto } from './dto/mechanic-create.dto.js';
import { MechanicQueryDto } from './dto/mechanic-query.dto.js';
import { UpdateMechanicDto } from './dto/mechanic-update.dto.js';
import { MechanicsService } from './mechanics.service.js';

@ApiTags('mechanics')
@ApiBearerAuth()
@Controller('mechanics')
export class MechanicsController {
  constructor(private readonly mechanics: MechanicsService) {}

  @Roles(RoleCode.ADMIN)
  @Post()
  create(@Body() dto: CreateMechanicDto) {
    return this.mechanics.create(dto);
  }

  @Get()
  list(@Query() q: MechanicQueryDto) {
    return this.mechanics.list(q);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.mechanics.getById(id);
  }

  @Roles(RoleCode.ADMIN)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateMechanicDto) {
    return this.mechanics.update(id, dto);
  }

  @Roles(RoleCode.ADMIN)
  @Patch(':id/status')
  status(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateActiveStatusDto) {
    return this.mechanics.setActive(id, dto.isActive);
  }
}
