import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() data: any) {
    return this.reviewsService.create(data);
  }

  @Get('product/:id')
  async byProduct(@Param('id') id: string) {
    return this.reviewsService.findByProduct(id);
  }

  @Get('product/:id/stats')
  async stats(@Param('id') id: string) {
    return this.reviewsService.getAverage(id);
  }
}
