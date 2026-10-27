import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Workshop } from '../entities/workshop.entity.js';

@Injectable()
export class WorkshopDao {
  constructor(@InjectRepository(Workshop) private readonly repository: Repository<Workshop>) {}

  async create(data: { name: string; address: string; isActive: boolean }): Promise<Workshop> {
    const workshop = this.repository.create(data);
    return this.repository.save(workshop);
  }

  async findById(id: string, manager?: EntityManager): Promise<Workshop | null> {
    const repository = manager ? manager.getRepository(Workshop) : this.repository;
    return repository.findOne({ where: { id } });
  }

  async findPaginated(page: number, limit: number, onlyActive: boolean): Promise<[Workshop[], number]> {
    return this.repository.findAndCount({
      where: onlyActive ? { isActive: true } : {},
      order: { name: 'ASC', id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async update(workshop: Workshop): Promise<Workshop> {
    return this.repository.save(workshop);
  }
}
