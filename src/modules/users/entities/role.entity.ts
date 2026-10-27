// src/modules/users/entities/role.entity.ts
import { BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

/** Role catalog entry; `code` matches `RoleCode`. The id is a UUIDv7 assigned before insert. */
@Entity('roles')
export class Role {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @BeforeInsert()
  assignId() {
    this.id ??= uuidv7();
  }
}
