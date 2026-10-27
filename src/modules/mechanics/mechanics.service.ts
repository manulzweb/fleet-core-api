import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { toPage } from '../../common/dto/page.js';
import { rethrowDbConflict } from '../../common/utils/db-errors.js';
import { UsersService } from '../users/users.service.js';
import { CreateMechanicDto } from './dto/mechanic-create.dto.js';
import { MechanicQueryDto } from './dto/mechanic-query.dto.js';
import { UpdateMechanicDto } from './dto/mechanic-update.dto.js';
import { MechanicDao } from './dao/mechanic.dao.js';
import { MechanicMapper } from './mapper/mechanic.mapper.js';

const CONFLICTS = {
  mechanics_email_key: 'A mechanic with this email already exists',
  mechanics_user_id_key: 'This user is already linked to another mechanic',
};

@Injectable()
export class MechanicsService {
  constructor(
    private readonly dao: MechanicDao,
    private readonly users: UsersService,
  ) {}

  private async assertUnique(email?: string, userId?: string, selfId?: string) {
    if (email) {
      const other = await this.dao.findByEmail(email);
      if (other && other.id !== selfId) throw new ConflictException('A mechanic with this email already exists');
    }
    if (userId) {
      await this.users.getEntity(userId);
      const other = await this.dao.findByUserId(userId);
      if (other && other.id !== selfId) throw new ConflictException('This user is already linked to another mechanic');
    }
  }

  async create(dto: CreateMechanicDto) {
    await this.assertUnique(dto.email, dto.userId);
    try {
      const m = await this.dao.create({ ...dto, isActive: true, userId: dto.userId ?? null });
      return MechanicMapper.toResponse(m);
    } catch (e) {
      rethrowDbConflict(e, CONFLICTS);
    }
  }

  async list(q: MechanicQueryDto) {
    return toPage(await this.dao.findPaginated(q.page, q.limit, q.isActive), q, MechanicMapper.toResponse);
  }

  async getEntity(id: string) {
    const m = await this.dao.findById(id);
    if (!m) throw new NotFoundException('Mechanic not found');
    return m;
  }

  async getById(id: string) {
    return MechanicMapper.toResponse(await this.getEntity(id));
  }

  findByUserId(userId: string) {
    return this.dao.findByUserId(userId);
  }

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

  async setActive(id: string, isActive: boolean) {
    const m = await this.getEntity(id);
    m.isActive = isActive;
    return MechanicMapper.toResponse(await this.dao.update(m));
  }
}
