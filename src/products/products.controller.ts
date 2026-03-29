import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { PaginatedProductsResponseDto } from './dto/paginated-products-response.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a product' })
  @ApiCreatedResponse({ description: 'Product created successfully' })
  create(@Body() body: CreateProductDto) {
    return this.productsService.create(body.name, body.price);
  }

  @Get()
  @ApiOperation({ summary: 'List products' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'items', required: false, type: Number, example: 100 })
  @ApiOkResponse({
    description: 'Products fetched successfully',
    type: PaginatedProductsResponseDto,
  })
  findAll(@Query() query: GetProductsQueryDto) {
    return this.productsService.findAll(query);
  }
}
