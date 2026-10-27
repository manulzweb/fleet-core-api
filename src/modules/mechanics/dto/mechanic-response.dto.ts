// src/modules/mechanics/dto/mechanic-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

/** Public representation of a mechanic. */
export class MechanicResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() email: string;
  @ApiProperty() specialty: string;
  @ApiProperty() isActive: boolean;
  @ApiProperty({ nullable: true }) userId: string | null;
}
