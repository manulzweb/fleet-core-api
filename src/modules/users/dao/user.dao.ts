import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity.js';
import { UserEntity } from '../entities/user.entity.js';

@Injectable()
export class UserDao {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
    roleId: string;
    isActive: boolean;
  }): Promise<UserEntity> {
    const user = this.repository.create(data);
    return this.repository.save(user);
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findPaginated(
    page: number,
    limit: number,
  ): Promise<[UserEntity[], number]> {
    return this.repository.findAndCount({
      order: { createdAt: 'ASC', id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findRoleByCode(code: string): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { code } });
  }

  async update(user: UserEntity): Promise<UserEntity> {
    return this.repository.save(user);
  }
}
