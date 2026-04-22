import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateDiningAreaDto {
  @ApiProperty({ example: 'VIP Area' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
      : value,
  )
  name: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 2, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  tables?: number;

  @ApiPropertyOptional({ example: 'table', default: 'table' })
  @IsOptional()
  @IsString()
  tableName?: string;
}
