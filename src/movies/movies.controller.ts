import { Controller, Get, Post, Delete, Patch, Param, Body, Query } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { WatchStatus } from '@prisma/client';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.moviesService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 6,
      search,
    );
  }

  @Post()
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.create(createMovieDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: WatchStatus) {
    return this.moviesService.updateStatus(Number(id), status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moviesService.remove(Number(id));
  }
}