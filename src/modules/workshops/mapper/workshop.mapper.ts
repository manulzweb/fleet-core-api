import { WorkshopResponseDto } from '../dto/workshop-response.dto.js';
import { Workshop } from '../entities/workshop.entity.js';

export const WorkshopMapper = {
  toResponse(w: Workshop): WorkshopResponseDto {
    return { id: w.id, name: w.name, address: w.address, isActive: w.isActive };
  },
};
