import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Mechanic } from '../entities/mechanic.entity.js';

@Injectable()
export class MechanicDao {
  constructor(@InjectRepository(Mechanic) private readonly repository: Repository<Mechanic>) {}

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

  async findById(id: string, manager?: EntityManager): Promise<Mechanic | null> {
    const repository = manager ? manager.getRepository(Mechanic) : this.repository;
    return repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<Mechanic | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findByUserId(userId: string): Promise<Mechanic | null> {
    return this.repository.findOne({ where: { userId } });
  }

  async findPaginated(page: number, limit: number, isActive?: boolean): Promise<[Mechanic[], number]> {
    return this.repository.findAndCount({
      where: isActive === undefined ? {} : { isActive },
      order: { name: 'ASC', id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async update(mechanic: Mechanic): Promise<Mechanic> {
    return this.repository.save(mechanic);
  }
}
