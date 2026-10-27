import { ApiProperty } from '@nestjs/swagger';
import {
  MaintenanceStatus,
  MaintenanceType,
} from '../../../common/enums/index.js';

export class MaintenanceResponseDto {
  @ApiProperty() id: string;
  @ApiProperty({ enum: MaintenanceType }) type: MaintenanceType;
  @ApiProperty() description: string;
  @ApiProperty() initialMileage: number;
  @ApiProperty() scheduledStartAt: Date;
  @ApiProperty() scheduledEndAt: Date;
  @ApiProperty({ enum: MaintenanceStatus }) status: MaintenanceStatus;
  @ApiProperty() vehicleId: string;
  @ApiProperty() mechanicId: string;
  @ApiProperty() workshopId: string;
  @ApiProperty({ nullable: true }) workPerformed: string | null;
  @ApiProperty({ nullable: true }) finalCost: number | null;
  @ApiProperty({ nullable: true }) completedAt: Date | null;
  @ApiProperty({ nullable: true }) finalMileage: number | null;
}
