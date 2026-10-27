import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { toPage } from '../../common/dto/page.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { RoleCode } from '../../common/enums/index.js';
import { UpdateUserDto } from './dto/user-update.dto.js';
import { UserDao } from './dao/user.dao.js';
import { UserMapper } from './mapper/user.mapper.js';

@Injectable()
export class UsersService {
  constructor(private readonly dao: UserDao) {}

  findByEmail(email: string) {
    return this.dao.findByEmail(email);
  }

  async create(
    data: { name: string; email: string; passwordHash: string },
    roleCode: RoleCode,
  ) {
    if (await this.dao.findByEmail(data.email)) {
      throw new ConflictException('Email is already registered');
    }
    const role = await this.dao.findRoleByCode(roleCode);
    if (!role) throw new NotFoundException(`Role ${roleCode} not found`);
    try {
      return await this.dao.create({
        ...data,
        role,
        roleId: role.id,
        isActive: true,
      });
    } catch (e: any) {
      if (e?.code === '23505')
        throw new ConflictException('Email is already registered');
      throw e;
    }
  }

  async getEntity(id: string) {
    const user = await this.dao.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getById(id: string) {
    return UserMapper.toResponse(await this.getEntity(id));
  }

  async list(q: PaginationQueryDto) {
    return toPage(
      await this.dao.findPaginated(q.page, q.limit),
      q,
      UserMapper.toResponse,
    );
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.getEntity(id);
    if (dto.name !== undefined) user.name = dto.name;
    if (dto.role !== undefined) {
      const role = await this.dao.findRoleByCode(dto.role);
      if (!role) throw new NotFoundException(`Role ${dto.role} not found`);
      user.role = role;
      user.roleId = role.id;
    }
    return UserMapper.toResponse(await this.dao.update(user));
  }

  async setStatus(id: string, isActive: boolean) {
    const user = await this.getEntity(id);
    user.isActive = isActive;
    await this.dao.update(user);
    return { id: user.id, isActive: user.isActive };
  }
}
