// src/modules/maintenances/dto/maintenance-create.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { MaintenanceType } from '../../../common/enums/index.js';

/**
 * Payload to schedule a maintenance. `scheduledEndAt` must be after `scheduledStartAt` (checked by the service).
 */
export class CreateMaintenanceDto {
  @ApiProperty({ enum: MaintenanceType })
  @IsEnum(MaintenanceType)
  type: MaintenanceType;
  @ApiProperty() @IsString() @MinLength(1) description: string;

  /**
   * Vehicle odometer reading (km) at the start; must be >= the vehicle's current mileage.
   */
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(2147483647)
  initialMileage: number;

  @ApiProperty() @Type(() => Date) @IsDate() scheduledStartAt: Date;
  @ApiProperty() @Type(() => Date) @IsDate() scheduledEndAt: Date;

  @ApiProperty() @IsUUID() vehicleId: string;
  @ApiProperty() @IsUUID() mechanicId: string;
  @ApiProperty() @IsUUID() workshopId: string;
}
