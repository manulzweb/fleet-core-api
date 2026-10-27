import { Injectable, NotFoundException } from '@nestjs/common';
import { toPage } from '../../common/dto/page.js';
import { RoleCode } from '../../common/enums/index.js';
import { CreateWorkshopDto } from './dto/workshop-create.dto.js';
import { UpdateWorkshopDto } from './dto/workshop-update.dto.js';
import { WorkshopQueryDto } from './dto/workshop-query.dto.js';
import { WorkshopDao } from './dao/workshop.dao.js';
import { WorkshopMapper } from './mapper/workshop.mapper.js';

@Injectable()
export class WorkshopsService {
  constructor(private readonly dao: WorkshopDao) {}

  async create(dto: CreateWorkshopDto) {
    const w = await this.dao.create({ ...dto, isActive: true });
    return WorkshopMapper.toResponse(w);
  }

  async list(q: WorkshopQueryDto, role: RoleCode) {
    const onlyActive = !(role === RoleCode.ADMIN && q.includeInactive);
    return toPage(await this.dao.findPaginated(q.page, q.limit, onlyActive), q, WorkshopMapper.toResponse);
  }

  async getEntity(id: string) {
    const w = await this.dao.findById(id);
    if (!w) throw new NotFoundException('Workshop not found');
    return w;
  }

  async getById(id: string) {
    return WorkshopMapper.toResponse(await this.getEntity(id));
  }

  async update(id: string, dto: UpdateWorkshopDto) {
    const w = await this.getEntity(id);
    Object.assign(w, dto);
    return WorkshopMapper.toResponse(await this.dao.update(w));
  }

  async setActive(id: string, isActive: boolean) {
    const w = await this.getEntity(id);
    w.isActive = isActive;
    return WorkshopMapper.toResponse(await this.dao.update(w));
  }
}
