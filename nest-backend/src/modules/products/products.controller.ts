import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Product } from '../../common/interfaces';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query() query: any): Promise<{ products: Product[] }> {
    const products = await this.productsService.findAll(query);
    return { products };
  }

  @Get('filters')
  async getFilters() {
    return this.productsService.getFilters();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Product> {
    const product = await this.productsService.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(@Body() createProductDto: Partial<Product>): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: Partial<Product>,
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.productsService.delete(id);
    return { message: 'Product deleted successfully' };
  }
}