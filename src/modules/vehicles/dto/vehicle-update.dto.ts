// src/modules/vehicles/dto/vehicle-update.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateVehicleDto } from './vehicle-create.dto.js';

/** Partial vehicle update; all creation fields are optional. */
export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {}
