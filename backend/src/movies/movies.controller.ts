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
    @Query('status') status?: string,       // Changed from WatchStatus to string
    @Query('genreId') genreId?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 6;
    
    // Safely parse or discard invalid status strings
    const validStatus = 
      status && Object.values(WatchStatus).includes(status as WatchStatus) 
        ? (status as WatchStatus) 
        : undefined;

    const genreIdNum = genreId && genreId !== '' ? parseInt(genreId, 10) : undefined;

    return this.moviesService.findAll(
      pageNum,
      limitNum,
      search,
      validStatus,
      genreIdNum,
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