// src/modules/mechanics/dto/mechanic-update.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateMechanicDto } from './mechanic-create.dto.js';

/** All fields of {@link CreateMechanicDto}, optional. */
export class UpdateMechanicDto extends PartialType(CreateMechanicDto) {}
