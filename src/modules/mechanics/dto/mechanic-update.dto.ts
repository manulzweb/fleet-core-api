import { PartialType } from '@nestjs/swagger';
import { CreateMechanicDto } from './mechanic-create.dto.js';

export class UpdateMechanicDto extends PartialType(CreateMechanicDto) {}
