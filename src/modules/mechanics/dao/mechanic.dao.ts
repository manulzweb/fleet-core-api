// src/modules/mechanics/dao/mechanic.dao.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Mechanic } from '../entities/mechanic.entity.js';

/** Persistence layer for {@link Mechanic}. */
@Injectable()
export class MechanicDao {
  constructor(
    @InjectRepository(Mechanic)
    private readonly repository: Repository<Mechanic>,
  ) {}

  /** Inserts and returns a new mechanic. */
  async create(data: {
    name: string;
    email: string;
    specialty: string;
    userId: string | null;
    isActive: boolean;
  }): Promise<Mechanic> {
    const mechanic = this.repository.create(data);
    return this.repository.save(mechanic);
  }

  /** Finds by id; pass `manager` to run inside a transaction. */
  async findById(
    id: string,
    manager?: EntityManager,
  ): Promise<Mechanic | null> {
    const repository = manager
      ? manager.getRepository(Mechanic)
      : this.repository;
    return repository.findOne({ where: { id } });
  }

  /** Finds by (already normalized) email. */
  async findByEmail(email: string): Promise<Mechanic | null> {
    return this.repository.findOne({ where: { email } });
  }

  /** Finds the mechanic linked to a user account. */
  async findByUserId(userId: string): Promise<Mechanic | null> {
    return this.repository.findOne({ where: { userId } });
  }

  /**
   * Returns `[rows, total]` ordered by name; `isActive` undefined means no filter.
   */
  async findPaginated(
    page: number,
    limit: number,
    isActive?: boolean,
  ): Promise<[Mechanic[], number]> {
    return this.repository.findAndCount({
      where: isActive === undefined ? {} : { isActive },
      order: { name: 'ASC', id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  /** Saves changes to an existing mechanic. */
  async update(mechanic: Mechanic): Promise<Mechanic> {
    return this.repository.save(mechanic);
  }
}
