// src/modules/mechanics/mechanics.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { toPage } from '../../common/dto/page.js';
import { rethrowDbConflict } from '../../common/utils/db-errors.js';
import { UsersService } from '../users/users.service.js';
import { CreateMechanicDto } from './dto/mechanic-create.dto.js';
import { MechanicQueryDto } from './dto/mechanic-query.dto.js';
import { UpdateMechanicDto } from './dto/mechanic-update.dto.js';
import { MechanicDao } from './dao/mechanic.dao.js';
import { MechanicMapper } from './mapper/mechanic.mapper.js';

/** Maps DB unique-constraint names to user-facing conflict messages. */
const CONFLICTS = {
  mechanics_email_key: 'A mechanic with this email already exists',
  mechanics_user_id_key: 'This user is already linked to another mechanic',
};

/**
 * Business logic for mechanics: uniqueness of email and linked user account.
 */
@Injectable()
export class MechanicsService {
  constructor(
    private readonly dao: MechanicDao,
    private readonly users: UsersService,
  ) {}

  /**
   * Ensures email and linked user are not used by another mechanic (`selfId` excludes the mechanic being updated).
   * @throws ConflictException on duplicate email or user already linked.
   * @throws NotFoundException if `userId` does not exist.
   */
  private async assertUnique(email?: string, userId?: string, selfId?: string) {
    if (email) {
      const other = await this.dao.findByEmail(email);
      if (other && other.id !== selfId)
        throw new ConflictException(
          'A mechanic with this email already exists',
        );
    }
    if (userId) {
      await this.users.getEntity(userId);
      const other = await this.dao.findByUserId(userId);
      if (other && other.id !== selfId)
        throw new ConflictException(
          'This user is already linked to another mechanic',
        );
    }
  }

  /**
   * Creates an active mechanic. DB unique violations that race past the pre-check are mapped to ConflictException.
   */
  async create(dto: CreateMechanicDto) {
    await this.assertUnique(dto.email, dto.userId);
    try {
      const m = await this.dao.create({
        ...dto,
        isActive: true,
        userId: dto.userId ?? null,
      });
      return MechanicMapper.toResponse(m);
    } catch (e) {
      rethrowDbConflict(e, CONFLICTS);
    }
  }

  /** Returns a page of mechanics ordered by name. */
  async list(q: MechanicQueryDto) {
    return toPage(
      await this.dao.findPaginated(q.page, q.limit, q.isActive),
      q,
      MechanicMapper.toResponse,
    );
  }

  /**
   * Loads the entity by id.
   * @throws NotFoundException if it does not exist.
   */
  async getEntity(id: string) {
    const m = await this.dao.findById(id);
    if (!m) throw new NotFoundException('Mechanic not found');
    return m;
  }

  /**
   * Loads a mechanic as a response DTO.
   * @throws NotFoundException if it does not exist.
   */
  async getById(id: string) {
    return MechanicMapper.toResponse(await this.getEntity(id));
  }

  /** Finds the mechanic linked to a user account, or null. */
  findByUserId(userId: string) {
    return this.dao.findByUserId(userId);
  }

  /**
   * Partially updates a mechanic.
   * @throws NotFoundException if missing.
   * @throws ConflictException on duplicate email or user.
   */
  async update(id: string, dto: UpdateMechanicDto) {
    const m = await this.getEntity(id);
    await this.assertUnique(dto.email, dto.userId, id);
    Object.assign(m, dto);
    try {
      return MechanicMapper.toResponse(await this.dao.update(m));
    } catch (e) {
      rethrowDbConflict(e, CONFLICTS);
    }
  }

  /** Sets the active flag. @throws NotFoundException if missing. */
  async setActive(id: string, isActive: boolean) {
    const m = await this.getEntity(id);
    m.isActive = isActive;
    return MechanicMapper.toResponse(await this.dao.update(m));
  }
}
