// src/modules/vehicles/mapper/vehicle.mapper.ts
import { VehicleResponseDto } from '../dto/vehicle-response.dto.js';
import { Vehicle } from '../entities/vehicle.entity.js';

/** Maps vehicle entities to response DTOs. */
export const VehicleMapper = {
  toResponse(v: Vehicle): VehicleResponseDto {
    return {
      id: v.id,
      plate: v.plate,
      brand: v.brand,
      model: v.model,
      year: v.year,
      currentMileage: v.currentMileage,
      status: v.status,
    };
  },
};
