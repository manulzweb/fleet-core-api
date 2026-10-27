import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1760000000000 implements MigrationInterface {
  name = 'InitialSchema1760000000000';

  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE EXTENSION IF NOT EXISTS btree_gist`);

    await q.query(`CREATE TABLE roles (
      id uuid PRIMARY KEY,
      code varchar(30) NOT NULL UNIQUE,
      name varchar(50) NOT NULL)`);

    await q.query(`CREATE TABLE users (
      id uuid PRIMARY KEY,
      name varchar(120) NOT NULL,
      email varchar(254) NOT NULL UNIQUE,
      password_hash varchar(255) NOT NULL,
      role_id uuid NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
      is_active boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now())`);

    await q.query(`CREATE TABLE vehicles (
      id uuid PRIMARY KEY,
      plate varchar(20) NOT NULL UNIQUE,
      brand varchar(80) NOT NULL,
      model varchar(80) NOT NULL,
      year smallint NOT NULL,
      current_mileage integer NOT NULL,
      status varchar(30) NOT NULL DEFAULT 'AVAILABLE',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT chk_vehicles_mileage CHECK (current_mileage >= 0),
      CONSTRAINT chk_vehicles_year CHECK (year BETWEEN 1950 AND 2100),
      CONSTRAINT chk_vehicles_status CHECK (status IN ('AVAILABLE','IN_MAINTENANCE','INACTIVE')))`);

    await q.query(`CREATE TABLE mechanics (
      id uuid PRIMARY KEY,
      name varchar(120) NOT NULL,
      email varchar(254) NOT NULL UNIQUE,
      specialty varchar(100) NOT NULL,
      is_active boolean NOT NULL DEFAULT true,
      user_id uuid UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now())`);

    await q.query(`CREATE TABLE workshops (
      id uuid PRIMARY KEY,
      name varchar(120) NOT NULL,
      address varchar(255) NOT NULL,
      is_active boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now())`);

    await q.query(`CREATE TABLE maintenances (
      id uuid PRIMARY KEY,
      type varchar(30) NOT NULL,
      description text NOT NULL,
      initial_mileage integer NOT NULL,
      scheduled_start_at timestamptz NOT NULL,
      scheduled_end_at timestamptz NOT NULL,
      status varchar(30) NOT NULL DEFAULT 'SCHEDULED',
      vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
      mechanic_id uuid NOT NULL REFERENCES mechanics(id) ON DELETE RESTRICT,
      workshop_id uuid NOT NULL REFERENCES workshops(id) ON DELETE RESTRICT,
      work_performed text,
      final_cost numeric(12,2),
      completed_at timestamptz,
      final_mileage integer,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT chk_mnt_type CHECK (type IN ('PREVENTIVE','CORRECTIVE')),
      CONSTRAINT chk_mnt_status CHECK (status IN ('SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED')),
      CONSTRAINT chk_mnt_initial_mileage CHECK (initial_mileage >= 0),
      CONSTRAINT chk_mnt_period CHECK (scheduled_end_at > scheduled_start_at),
      CONSTRAINT chk_mnt_final_cost CHECK (final_cost IS NULL OR final_cost >= 0),
      CONSTRAINT chk_mnt_final_mileage CHECK (final_mileage IS NULL OR final_mileage >= initial_mileage),
      CONSTRAINT excl_mnt_mechanic_overlap EXCLUDE USING gist (
        mechanic_id WITH =,
        tstzrange(scheduled_start_at, scheduled_end_at, '[)') WITH &&
      ) WHERE (status IN ('SCHEDULED','IN_PROGRESS')))`);

    await q.query(`CREATE UNIQUE INDEX uq_mnt_vehicle_active ON maintenances (vehicle_id)
      WHERE status IN ('SCHEDULED','IN_PROGRESS')`);
    await q.query(`CREATE INDEX idx_mnt_vehicle ON maintenances (vehicle_id)`);
    await q.query(`CREATE INDEX idx_mnt_mechanic ON maintenances (mechanic_id)`);
  }

  async down(q: QueryRunner): Promise<void> {
    for (const t of ['maintenances', 'workshops', 'mechanics', 'vehicles', 'users', 'roles']) {
      await q.query(`DROP TABLE IF EXISTS ${t}`);
    }
  }
}
