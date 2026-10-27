// src/modules/workshops/dto/workshop-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

/** Pagination plus `includeInactive` (honoured for ADMIN only). */
export class WorkshopQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'ADMIN only; others always get active workshops',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  includeInactive?: boolean;
}
