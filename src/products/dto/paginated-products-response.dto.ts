import { ApiProperty } from '@nestjs/swagger';

export class PaginatedProductsResponseDto {
  @ApiProperty({ type: 'array' })
  products: unknown[];

  @ApiProperty({ example: 0 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 100, name: 'page_size' })
  page_size: number;
}
