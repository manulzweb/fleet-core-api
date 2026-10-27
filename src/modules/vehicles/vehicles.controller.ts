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
import { CreateVehicleDto } from './dto/vehicle-create.dto.js';
import { UpdateVehicleDto } from './dto/vehicle-update.dto.js';
import { UpdateVehicleStatusDto } from './dto/vehicle-update-status.dto.js';
import { VehicleQueryDto } from './dto/vehicle-query.dto.js';
import { VehiclesService } from './vehicles.service.js';

@ApiTags('vehicles')
@ApiBearerAuth()
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehicles: VehiclesService) {}

  @Roles(RoleCode.ADMIN)
  @Post()
  create(@Body() dto: CreateVehicleDto) {
    return this.vehicles.create(dto);
  }

  @Get()
  list(@Query() q: VehicleQueryDto) {
    return this.vehicles.list(q);
  }

  @Get('plate/:plate')
  byPlate(@Param('plate') plate: string) {
    return this.vehicles.getByPlate(plate);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehicles.getById(id);
  }

  @Roles(RoleCode.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehicles.update(id, dto);
  }

  @Roles(RoleCode.ADMIN)
  @Patch(':id/status')
  status(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVehicleStatusDto,
  ) {
    return this.vehicles.changeStatus(id, dto.status);
  }
}
