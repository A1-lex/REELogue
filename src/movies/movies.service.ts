import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { WatchStatus } from '@prisma/client';

@Injectable()
export class MoviesService {
  constructor(private prisma: PrismaService) {}

  async create(createMovieDto: CreateMovieDto) {
    const { genreIds, ...movieData } = createMovieDto;
    return this.prisma.movie.create({
      data: {
        ...movieData,
        genres: {
          connect: genreIds.map((id) => ({ id })),
        },
      },
      include: { genres: true },
    });
  }

  async findAll() {
    return this.prisma.movie.findMany({
      include: { genres: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: number) {
    return this.prisma.movie.delete({
      where: { id },
    });
  }

  async updateStatus(id: number, status: WatchStatus) {
    return this.prisma.movie.update({
      where: { id },
      data: { status },
      include: { genres: true },
    });
  }
}