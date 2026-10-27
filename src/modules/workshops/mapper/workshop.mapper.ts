// src/modules/workshops/mapper/workshop.mapper.ts
import { WorkshopResponseDto } from '../dto/workshop-response.dto.js';
import { Workshop } from '../entities/workshop.entity.js';

/** Maps Workshop entities to response DTOs. */
export const WorkshopMapper = {
  toResponse(w: Workshop): WorkshopResponseDto {
    return { id: w.id, name: w.name, address: w.address, isActive: w.isActive };
  },
};
