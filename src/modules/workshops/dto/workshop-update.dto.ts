import { PartialType } from '@nestjs/swagger';
import { CreateWorkshopDto } from './workshop-create.dto.js';

export class UpdateWorkshopDto extends PartialType(CreateWorkshopDto) {}
