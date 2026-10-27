import { ApiProperty } from '@nestjs/swagger';

export class WorkshopResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() address: string;
  @ApiProperty() isActive: boolean;
}
