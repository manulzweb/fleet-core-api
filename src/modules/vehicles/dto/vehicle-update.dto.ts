import { PartialType } from '@nestjs/swagger';
import { CreateVehicleDto } from './vehicle-create.dto.js';

export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {}
