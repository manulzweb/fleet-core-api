// src/modules/mechanics/dto/mechanic-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

/** Pagination plus optional `isActive` filter. */
export class MechanicQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined ? value : value === true || value === 'true',
  )
  @IsBoolean()
  isActive?: boolean;
}
