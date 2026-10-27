// src/common/dto/update-active-status.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

/** Body for endpoints that activate or deactivate a resource. */
export class UpdateActiveStatusDto {
  @ApiProperty() @IsBoolean() isActive: boolean;
}
