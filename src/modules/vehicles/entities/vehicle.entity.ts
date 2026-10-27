// src/modules/vehicles/entities/vehicle.entity.ts
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { VehicleStatus } from '../../../common/enums/index.js';

/** Fleet vehicle. */
@Entity('vehicles')
export class Vehicle extends BaseEntity {
  /** Unique, normalized plate. */
  @Column({ type: 'varchar', length: 20, unique: true })
  plate: string;

  @Column({ type: 'varchar', length: 80 })
  brand: string;

  @Column({ type: 'varchar', length: 80 })
  model: string;

  @Column({ type: 'smallint' })
  year: number;

  /** Odometer reading; must never decrease. */
  @Column({ name: 'current_mileage', type: 'integer' })
  currentMileage: number;

  @Column({ type: 'varchar', length: 30, default: VehicleStatus.AVAILABLE })
  status: VehicleStatus;
}
