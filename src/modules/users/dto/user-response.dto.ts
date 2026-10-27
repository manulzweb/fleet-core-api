import { ApiProperty } from '@nestjs/swagger';
import { RoleCode } from '../../../common/enums/index.js';

export class UserResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() email: string;
  @ApiProperty({ enum: RoleCode }) role: RoleCode;
  @ApiProperty() isActive: boolean;
}
