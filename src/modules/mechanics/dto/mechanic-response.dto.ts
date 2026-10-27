import { ApiProperty } from '@nestjs/swagger';

export class MechanicResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() email: string;
  @ApiProperty() specialty: string;
  @ApiProperty() isActive: boolean;
  @ApiProperty({ nullable: true }) userId: string | null;
}
