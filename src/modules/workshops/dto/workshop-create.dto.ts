import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateWorkshopDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(120) name: string;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(255) address: string;
}
