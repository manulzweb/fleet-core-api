import { ApiProperty } from '@nestjs/swagger';

export class UserStatusResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() isActive: boolean;
}
