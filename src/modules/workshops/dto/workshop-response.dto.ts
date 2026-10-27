// src/modules/workshops/dto/workshop-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

/** Public representation of a workshop. */
export class WorkshopResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() address: string;
  @ApiProperty() isActive: boolean;
}
