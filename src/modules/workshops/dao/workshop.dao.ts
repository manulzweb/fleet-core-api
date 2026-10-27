// src/modules/workshops/dao/workshop.dao.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Workshop } from '../entities/workshop.entity.js';

/** Persistence layer for {@link Workshop}. */
@Injectable()
export class WorkshopDao {
  constructor(
    @InjectRepository(Workshop)
    private readonly repository: Repository<Workshop>,
  ) {}

  /** Inserts and returns a new workshop. */
  async create(data: {
    name: string;
    address: string;
    isActive: boolean;
  }): Promise<Workshop> {
    const workshop = this.repository.create(data);
    return this.repository.save(workshop);
  }

  /** Finds by id; pass `manager` to run inside a transaction. */
  async findById(
    id: string,
    manager?: EntityManager,
  ): Promise<Workshop | null> {
    const repository = manager
      ? manager.getRepository(Workshop)
      : this.repository;
    return repository.findOne({ where: { id } });
  }

  /**
   * Returns `[rows, total]` ordered by name; `onlyActive` restricts to active workshops.
   */
  async findPaginated(
    page: number,
    limit: number,
    onlyActive: boolean,
  ): Promise<[Workshop[], number]> {
    return this.repository.findAndCount({
      where: onlyActive ? { isActive: true } : {},
      order: { name: 'ASC', id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  /** Saves changes to an existing workshop. */
  async update(workshop: Workshop): Promise<Workshop> {
    return this.repository.save(workshop);
  }
}
