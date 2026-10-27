import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty() accessToken: string;
  @ApiProperty({ example: 'Bearer' }) tokenType: 'Bearer';
}
