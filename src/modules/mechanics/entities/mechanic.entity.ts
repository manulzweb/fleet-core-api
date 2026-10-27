// src/modules/mechanics/entities/mechanic.entity.ts
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { UserEntity } from '../../users/entities/user.entity.js';

/** A workshop technician who performs maintenances; `email` is unique. */
@Entity('mechanics')
export class Mechanic extends BaseEntity {
  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 254, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100 })
  specialty: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  /** Links the mechanic to the technician account that works on its assignments. */
  @Column({ name: 'user_id', type: 'uuid', nullable: true, unique: true })
  userId: string | null;

  @OneToOne(() => UserEntity, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity | null;
}
