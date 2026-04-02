import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AccessTokenPayload } from '../auth/jwt-auth.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { PaginatedProductsResponseDto } from './dto/paginated-products-response.dto';
import { ProductCategoryDto } from './dto/product-categories-response.dto';

type AuthenticatedRequest = Request & { user: AccessTokenPayload };

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('categories')
  @ApiOperation({ summary: 'List product categories' })
  @ApiOkResponse({
    description: 'Product categories fetched successfully',
    type: ProductCategoryDto,
    isArray: true,
  })
  findAllCategories() {
    return this.productsService.findAllCategories();
  }

  @Post()
  @ApiOperation({ summary: 'Create a product' })
  @ApiCreatedResponse({ description: 'Product created successfully' })
  create(@Req() request: AuthenticatedRequest, @Body() body: CreateProductDto) {
    return this.productsService.create(
      body.name,
      body.price,
      body.categoryId,
      request.user.restaurantId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List products' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'items', required: false, type: Number, example: 100 })
  @ApiOkResponse({
    description: 'Products fetched successfully',
    type: PaginatedProductsResponseDto,
  })
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query() query: GetProductsQueryDto,
  ) {
    return this.productsService.findAll(query, request.user.restaurantId);
  }
}
