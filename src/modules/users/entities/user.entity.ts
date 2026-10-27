// src/modules/users/entities/user.entity.ts
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { Role } from './role.entity.js';

/** Application user. Always loaded with its role (eager). */
@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 120 })
  name: string;

  /** Unique, normalized (lowercase) email. */
  @Column({ type: 'varchar', length: 254, unique: true })
  email: string;

  /** bcrypt hash; never expose it. */
  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @ManyToOne(() => Role, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
