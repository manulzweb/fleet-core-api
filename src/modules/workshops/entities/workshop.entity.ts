// src/modules/workshops/entities/workshop.entity.ts
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';

/** A physical workshop where maintenances are performed. */
@Entity('workshops')
export class Workshop extends BaseEntity {
  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
