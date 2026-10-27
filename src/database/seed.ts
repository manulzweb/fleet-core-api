// src/database/seed.ts
import * as bcrypt from 'bcrypt';
import { DataSource, EntityManager } from 'typeorm';
import dataSource from './data-source.js';
import { Role } from '../modules/users/entities/role.entity.js';
import { UserEntity } from '../modules/users/entities/user.entity.js';
import { Vehicle } from '../modules/vehicles/entities/vehicle.entity.js';
import { Mechanic } from '../modules/mechanics/entities/mechanic.entity.js';
import { Workshop } from '../modules/workshops/entities/workshop.entity.js';
import { Maintenance } from '../modules/maintenances/entities/maintenance.entity.js';
import {
  MaintenanceStatus,
  MaintenanceType,
  RoleCode,
  VehicleStatus,
} from '../common/enums/index.js';

/** Builds a stable UUIDv7-shaped identifier so the seed stays idempotent. */
const id = (n: number) =>
  `019a0000-0000-7000-8000-${String(n).padStart(12, '0')}`;
const SEED_PASSWORD = process.env.SEED_PASSWORD ?? 'Passw0rd!123';

/** Inserts the entity, or updates it in place when its id already exists. */
async function upsert<T extends { id: string }>(
  m: EntityManager,
  entity: new () => T,
  data: T,
) {
  const repo = m.getRepository(entity as any);
  const existing = await repo.findOne({ where: { id: data.id } } as any);
  await repo.save(Object.assign(existing ?? new entity(), data) as any);
}

/**
 * Populates roles, users, mechanics, workshops, vehicles and maintenances with
 * demo data in one transaction. Safe to run repeatedly.
 */
export async function seed(ds: DataSource) {
  const hash = await bcrypt.hash(SEED_PASSWORD, 10);
  await ds.transaction(async (m) => {
    const roles = [
      { id: id(1), code: RoleCode.ADMIN, name: 'Administrator' },
      { id: id(2), code: RoleCode.TECHNICIAN, name: 'Technician' },
    ];
    for (const r of roles) await upsert(m, Role, r as Role);

    const users = [
      {
        id: id(10),
        name: 'Admin',
        email: 'admin@fleetcore.local',
        roleId: id(1),
      },
      {
        id: id(11),
        name: 'Técnico Uno',
        email: 'tech1@fleetcore.local',
        roleId: id(2),
      },
      {
        id: id(12),
        name: 'Técnico Dos',
        email: 'tech2@fleetcore.local',
        roleId: id(2),
      },
    ];
    for (const u of users) {
      await upsert(m, UserEntity, {
        ...u,
        passwordHash: hash,
        isActive: true,
      } as UserEntity);
    }

    const mechanics = [
      {
        id: id(20),
        name: 'Carlos Pérez',
        email: 'carlos@fleetcore.local',
        specialty: 'Engine',
        isActive: true,
        userId: id(11),
      },
      {
        id: id(21),
        name: 'Ana Gómez',
        email: 'ana@fleetcore.local',
        specialty: 'Brakes',
        isActive: true,
        userId: id(12),
      },
      {
        id: id(22),
        name: 'Luis Rojas',
        email: 'luis@fleetcore.local',
        specialty: 'Electrical',
        isActive: false,
        userId: null,
      },
    ];
    for (const x of mechanics) await upsert(m, Mechanic, x as Mechanic);

    const workshops = [
      {
        id: id(30),
        name: 'Taller Norte',
        address: 'Calle 100 # 15-20',
        isActive: true,
      },
      {
        id: id(31),
        name: 'Taller Sur',
        address: 'Carrera 50 # 10-05',
        isActive: false,
      },
    ];
    for (const w of workshops) await upsert(m, Workshop, w as Workshop);

    const vehicles = [
      {
        id: id(40),
        plate: 'ABC123',
        brand: 'Chevrolet',
        model: 'NPR',
        year: 2022,
        currentMileage: 45000,
        status: VehicleStatus.AVAILABLE,
      },
      {
        id: id(41),
        plate: 'DEF456',
        brand: 'Toyota',
        model: 'Hilux',
        year: 2023,
        currentMileage: 12000,
        status: VehicleStatus.AVAILABLE,
      },
      {
        id: id(42),
        plate: 'GHI789',
        brand: 'Hino',
        model: '300',
        year: 2021,
        currentMileage: 80000,
        status: VehicleStatus.IN_MAINTENANCE,
      },
      {
        id: id(43),
        plate: 'JKL012',
        brand: 'Ford',
        model: 'Transit',
        year: 2019,
        currentMileage: 150000,
        status: VehicleStatus.INACTIVE,
      },
    ];
    for (const v of vehicles) await upsert(m, Vehicle, v as Vehicle);

    const day = (d: number) => new Date(Date.UTC(2026, 8, d, 8, 0, 0));
    const maintenances = [
      {
        id: id(50),
        type: MaintenanceType.CORRECTIVE,
        description: 'Brake system repair',
        initialMileage: 80000,
        scheduledStartAt: day(20),
        scheduledEndAt: day(21),
        status: MaintenanceStatus.IN_PROGRESS,
        vehicleId: id(42),
        mechanicId: id(21),
        workshopId: id(30),
        workPerformed: null,
        finalCost: null,
        completedAt: null,
        finalMileage: null,
      },
      {
        id: id(51),
        type: MaintenanceType.PREVENTIVE,
        description: 'Oil and filter replacement',
        initialMileage: 44800,
        scheduledStartAt: day(14),
        scheduledEndAt: day(15),
        status: MaintenanceStatus.COMPLETED,
        vehicleId: id(40),
        mechanicId: id(20),
        workshopId: id(30),
        workPerformed: 'Oil and filter replaced',
        finalCost: 350000,
        completedAt: day(15),
        finalMileage: 45000,
      },
    ];
    for (const x of maintenances)
      await upsert(m, Maintenance, x as Maintenance);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await dataSource.initialize();
  await seed(dataSource);
  console.log('Seed completed');
  await dataSource.destroy();
}
