// src/modules/maintenances/dto/maintenance-update-status.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { MaintenanceStatus } from '../../../common/enums/index.js';

/** Closure data is validated by the service (400 when completing without it). */
export class UpdateMaintenanceStatusDto {
  @ApiProperty({ enum: MaintenanceStatus })
  @IsEnum(MaintenanceStatus)
  status: MaintenanceStatus;

  @ApiPropertyOptional() @IsOptional() @IsString() workPerformed?: string;

  /** Final cost in currency units, up to 2 decimals. */
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  finalCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  completedAt?: Date;

  /** Odometer reading at completion; must be >= initialMileage. */
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(2147483647)
  finalMileage?: number;
}
