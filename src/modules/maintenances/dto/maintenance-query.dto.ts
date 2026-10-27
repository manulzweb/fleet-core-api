import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { MaintenanceStatus } from '../../../common/enums/index.js';

export class MaintenanceQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() vehicleId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() mechanicId?: string;
  @ApiPropertyOptional({ enum: MaintenanceStatus }) @IsOptional() @IsEnum(MaintenanceStatus) status?: MaintenanceStatus;
}
