import { ApiProperty } from '@nestjs/swagger';
import { VehicleStatus } from '../../../common/enums/index.js';

export class VehicleResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() plate: string;
  @ApiProperty() brand: string;
  @ApiProperty() model: string;
  @ApiProperty() year: number;
  @ApiProperty() currentMileage: number;
  @ApiProperty({ enum: VehicleStatus }) status: VehicleStatus;
}
