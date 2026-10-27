// src/modules/workshops/dto/workshop-update.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateWorkshopDto } from './workshop-create.dto.js';

/** All fields of {@link CreateWorkshopDto}, optional. */
export class UpdateWorkshopDto extends PartialType(CreateWorkshopDto) {}
