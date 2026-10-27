import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { VehicleStatus } from '../../../common/enums/index.js';

export class UpdateVehicleStatusDto {
  @ApiProperty({ enum: [VehicleStatus.AVAILABLE, VehicleStatus.INACTIVE] })
  @IsIn([VehicleStatus.AVAILABLE, VehicleStatus.INACTIVE], {
    message:
      'status can only be AVAILABLE or INACTIVE; IN_MAINTENANCE is controlled by maintenance operations',
  })
  status: VehicleStatus;
}
