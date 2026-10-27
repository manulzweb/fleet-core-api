import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsString, Matches, Max, MaxLength, Min } from 'class-validator';
import { normalizePlate } from '../../../common/utils/normalize-plate.js';

const plateTransform = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? normalizePlate(value) : value;

export class CreateVehicleDto {
  @ApiProperty({ example: 'ABC123' })
  @IsString()
  @Transform(plateTransform)
  @Matches(/^[A-Z0-9]{3,20}$/, {
    message: 'plate must be 3-20 alphanumeric characters',
  })
  plate: string;

  @ApiProperty() @IsString() @MaxLength(80) brand: string;
  @ApiProperty() @IsString() @MaxLength(80) model: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1950)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(2147483647)
  currentMileage: number;
}
