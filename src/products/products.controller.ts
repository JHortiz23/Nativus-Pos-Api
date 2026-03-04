import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    create(@Body() body: { name: string; price: number }) {
        return this.productsService.create(body.name, body.price);
    }

    @Get()
    findAll() {
        return this.productsService.findAll();
    }
}