import { ApiProperty } from '@nestjs/swagger';

class ProductListCategoryDto {
  @ApiProperty({ example: 'Bebidas' })
  name: string;
}

class ProductListItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 7 })
  restaurantId: number;

  @ApiProperty({ example: 3 })
  categoryId: number;

  @ApiProperty({ example: 'Hamburguesa' })
  name: string;

  @ApiProperty({ example: 'Hamburguesa clasica' })
  description: string | null;

  @ApiProperty({ example: 12.5 })
  price: number;

  @ApiProperty({ example: '2026-04-02T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ type: ProductListCategoryDto })
  category: ProductListCategoryDto;
}

export class PaginatedProductsResponseDto {
  @ApiProperty({ type: ProductListItemDto, isArray: true })
  products: ProductListItemDto[];

  @ApiProperty({ example: 0 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 100, name: 'page_size' })
  page_size: number;
}
