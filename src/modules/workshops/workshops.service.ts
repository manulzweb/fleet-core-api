// src/modules/workshops/workshops.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { toPage } from '../../common/dto/page.js';
import { RoleCode } from '../../common/enums/index.js';
import { CreateWorkshopDto } from './dto/workshop-create.dto.js';
import { UpdateWorkshopDto } from './dto/workshop-update.dto.js';
import { WorkshopQueryDto } from './dto/workshop-query.dto.js';
import { WorkshopDao } from './dao/workshop.dao.js';
import { WorkshopMapper } from './mapper/workshop.mapper.js';

/** Business logic for workshops. */
@Injectable()
export class WorkshopsService {
  constructor(private readonly dao: WorkshopDao) {}

  /** Creates an active workshop. */
  async create(dto: CreateWorkshopDto) {
    const w = await this.dao.create({ ...dto, isActive: true });
    return WorkshopMapper.toResponse(w);
  }

  /**
   * Returns a page of workshops; inactive ones are included only for ADMIN with `includeInactive`.
   */
  async list(q: WorkshopQueryDto, role: RoleCode) {
    const onlyActive = !(role === RoleCode.ADMIN && q.includeInactive);
    return toPage(
      await this.dao.findPaginated(q.page, q.limit, onlyActive),
      q,
      WorkshopMapper.toResponse,
    );
  }

  /**
   * Loads the entity by id.
   * @throws NotFoundException if it does not exist.
   */
  async getEntity(id: string) {
    const w = await this.dao.findById(id);
    if (!w) throw new NotFoundException('Workshop not found');
    return w;
  }

  /**
   * Loads a workshop as a response DTO.
   * @throws NotFoundException if it does not exist.
   */
  async getById(id: string) {
    return WorkshopMapper.toResponse(await this.getEntity(id));
  }

  /** Partially updates a workshop. @throws NotFoundException if missing. */
  async update(id: string, dto: UpdateWorkshopDto) {
    const w = await this.getEntity(id);
    Object.assign(w, dto);
    return WorkshopMapper.toResponse(await this.dao.update(w));
  }

  /** Sets the active flag. @throws NotFoundException if missing. */
  async setActive(id: string, isActive: boolean) {
    const w = await this.getEntity(id);
    w.isActive = isActive;
    return WorkshopMapper.toResponse(await this.dao.update(w));
  }
}
