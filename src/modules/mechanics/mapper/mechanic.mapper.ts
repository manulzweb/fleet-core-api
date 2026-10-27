import { MechanicResponseDto } from '../dto/mechanic-response.dto.js';
import { Mechanic } from '../entities/mechanic.entity.js';

export const MechanicMapper = {
  toResponse(m: Mechanic): MechanicResponseDto {
    return {
      id: m.id,
      name: m.name,
      email: m.email,
      specialty: m.specialty,
      isActive: m.isActive,
      userId: m.userId ?? null,
    };
  },
};
