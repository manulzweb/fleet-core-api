// src/modules/users/users.service.ts
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

/** User business logic: lookups, creation with role assignment, updates and activation. */
@Injectable()
export class UsersService {
  constructor(private readonly dao: UserDao) {}

  /** Finds a user by (already normalized) email, or `null`. */
  findByEmail(email: string) {
    return this.dao.findByEmail(email);
  }

  /**
   * Creates an active user with the given role.
   * @throws ConflictException if the email is already registered (including a race on the unique index).
   * @throws NotFoundException if the role code does not exist.
   */
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

  /**
   * Loads a user entity by id.
   * @throws NotFoundException if it does not exist.
   */
  async getEntity(id: string) {
    const user = await this.dao.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Returns a user as a response DTO.
   * @throws NotFoundException if it does not exist.
   */
  async getById(id: string) {
    return UserMapper.toResponse(await this.getEntity(id));
  }

  /** Returns a page of users. */
  async list(q: PaginationQueryDto) {
    return toPage(
      await this.dao.findPaginated(q.page, q.limit),
      q,
      UserMapper.toResponse,
    );
  }

  /**
   * Updates a user's name and/or role; omitted fields are left unchanged.
   * @throws NotFoundException if the user or the role does not exist.
   */
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

  /**
   * Sets the user's active flag.
   * @throws NotFoundException if the user does not exist.
   */
  async setStatus(id: string, isActive: boolean) {
    const user = await this.getEntity(id);
    user.isActive = isActive;
    await this.dao.update(user);
    return { id: user.id, isActive: user.isActive };
  }
}
