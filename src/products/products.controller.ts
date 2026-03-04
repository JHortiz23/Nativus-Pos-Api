import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    create(@Body() body: CreateProductDto) {
        return this.productsService.create(body.name, body.price);
    }

    @Get()
    findAll() {
        return this.productsService.findAll();
    }
}
