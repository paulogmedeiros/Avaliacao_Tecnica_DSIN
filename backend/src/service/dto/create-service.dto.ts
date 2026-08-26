import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'Hidratação' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name!: string;

  @ApiPropertyOptional({ example: 'Hidratação profunda dos fios' })
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  description?: string;

  @ApiProperty({ example: 55 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiProperty({ example: 45 })
  @IsInt()
  @Min(1)
  durationMinutes!: number;
}
