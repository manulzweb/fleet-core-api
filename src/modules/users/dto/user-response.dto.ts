// src/modules/users/dto/user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { RoleCode } from '../../../common/enums/index.js';

/** Public representation of a user (never includes the password hash). */
export class UserResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() email: string;
  @ApiProperty({ enum: RoleCode }) role: RoleCode;
  @ApiProperty() isActive: boolean;
}
