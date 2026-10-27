// src/modules/users/dto/user-status-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

/** Result of changing a user's active status. */
export class UserStatusResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() isActive: boolean;
}
