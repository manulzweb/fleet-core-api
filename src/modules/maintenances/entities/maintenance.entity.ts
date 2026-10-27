// src/modules/maintenances/entities/maintenance.entity.ts
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import {
  MaintenanceStatus,
  MaintenanceType,
} from '../../../common/enums/index.js';
import { Mechanic } from '../../mechanics/entities/mechanic.entity.js';
import { Vehicle } from '../../vehicles/entities/vehicle.entity.js';
import { Workshop } from '../../workshops/entities/workshop.entity.js';

/**
 * A maintenance job assigned to a mechanic at a workshop for a vehicle.
 * Completion fields stay null until the maintenance is COMPLETED.
 */
@Entity('maintenances')
export class Maintenance extends BaseEntity {
  @Column({ type: 'varchar', length: 30 })
  type: MaintenanceType;

  @Column({ type: 'text' })
  description: string;

  /** Odometer reading (km) when scheduled. */
  @Column({ name: 'initial_mileage', type: 'integer' })
  initialMileage: number;

  @Column({ name: 'scheduled_start_at', type: 'timestamptz' })
  scheduledStartAt: Date;

  @Column({ name: 'scheduled_end_at', type: 'timestamptz' })
  scheduledEndAt: Date;

  @Column({ type: 'varchar', length: 30, default: MaintenanceStatus.SCHEDULED })
  status: MaintenanceStatus;

  @Column({ name: 'vehicle_id', type: 'uuid' })
  vehicleId: string;
  @ManyToOne(() => Vehicle, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle?: Vehicle;

  @Column({ name: 'mechanic_id', type: 'uuid' })
  mechanicId: string;
  @ManyToOne(() => Mechanic, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'mechanic_id' })
  mechanic?: Mechanic;

  @Column({ name: 'workshop_id', type: 'uuid' })
  workshopId: string;
  @ManyToOne(() => Workshop, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'workshop_id' })
  workshop?: Workshop;

  @Column({ name: 'work_performed', type: 'text', nullable: true })
  workPerformed: string | null;

  @Column({
    name: 'final_cost',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: {
      to: (v?: number | null) => v,
      from: (v: string | null) => (v === null ? null : Number(v)),
    },
  })
  finalCost: number | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'final_mileage', type: 'integer', nullable: true })
  finalMileage: number | null;
}
