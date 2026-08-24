import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsString, Length, ValidateIf } from 'class-validator';

export class UpdateServiceDto {
  @ApiPropertyOptional({ example: 'Hidratação profunda' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @Length(2, 100)
  name?: string;

  @ApiPropertyOptional({ example: null, nullable: true })
  @ValidateIf((_object, value) => value !== undefined && value !== null)
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ example: false })
  @ValidateIf((_object, value) => value !== undefined)
  @IsBoolean()
  isActive?: boolean;
}

