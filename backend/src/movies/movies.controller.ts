import { Controller, Get, Post, Delete, Patch, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { WatchStatus } from '@prisma/client';
import { FindMoviesQueryDto } from './dto/find-movies-query.dto';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  findAll(@Query() q: FindMoviesQueryDto) {
    return this.moviesService.findAll(q.page, q.limit, q.search, q.status, q.genreId);
  }

  @Post()
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.create(createMovieDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: WatchStatus) {
    return this.moviesService.updateStatus(id, status);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.remove(id);
  }
}