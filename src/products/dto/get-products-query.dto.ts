import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetProductsQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    example: 100,
    default: 100,
    minimum: 1,
    description: 'Cantidad de productos por pagina',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  items = 100;
}
