// src/modules/maintenances/mapper/maintenance.mapper.ts
import { MaintenanceResponseDto } from '../dto/maintenance-response.dto.js';
import { Maintenance } from '../entities/maintenance.entity.js';

/** Maps Maintenance entities to API shapes. */
export const MaintenanceMapper = {
  toResponse(m: Maintenance): MaintenanceResponseDto {
    return {
      id: m.id,
      type: m.type,
      description: m.description,
      initialMileage: m.initialMileage,
      scheduledStartAt: m.scheduledStartAt,
      scheduledEndAt: m.scheduledEndAt,
      status: m.status,
      vehicleId: m.vehicleId,
      mechanicId: m.mechanicId,
      workshopId: m.workshopId,
      workPerformed: m.workPerformed,
      finalCost: m.finalCost,
      completedAt: m.completedAt,
      finalMileage: m.finalMileage,
    };
  },

  /** Shape used by the external integration endpoint. */
  toHistoryItem(m: Maintenance) {
    return {
      id: m.id,
      type: m.type,
      status: m.status,
      description: m.description,
      mileage: m.finalMileage,
      cost: m.finalCost,
      finishedAt: m.completedAt,
      mechanic: { id: m.mechanic!.id, name: m.mechanic!.name },
      workshop: { id: m.workshop!.id, name: m.workshop!.name },
    };
  },
};
