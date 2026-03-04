import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a product' })
    @ApiCreatedResponse({ description: 'Product created successfully' })
    create(@Body() body: CreateProductDto) {
        return this.productsService.create(body.name, body.price);
    }

    @Get()
    @ApiOperation({ summary: 'List products' })
    @ApiOkResponse({ description: 'Products fetched successfully' })
    findAll() {
        return this.productsService.findAll();
    }
}
