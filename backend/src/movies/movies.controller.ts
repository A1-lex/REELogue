import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { FindMoviesQueryDto } from './dto/find-movies-query.dto';
import { UpdateMovieStatusDto } from './dto/update-movie-status.dto';
import { MoviesService } from './movies.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request';

@UseGuards(JwtAuthGuard)
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query() query: FindMoviesQueryDto,
  ) {
    return this.moviesService.findAll(
      request.user.id,
      query.page,
      query.limit,
      query.search,
      query.status,
      query.genreId,
    );
  }

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateMovieDto,
  ) {
    return this.moviesService.create(request.user.id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMovieStatusDto,
  ) {
    return this.moviesService.updateStatus(request.user.id, id, dto.status);
  }

  @Delete(':id')
  remove(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.moviesService.remove(request.user.id, id);
  }
}