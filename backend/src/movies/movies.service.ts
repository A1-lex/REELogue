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

async findAll(page: number = 1, limit: number = 6, search?: string) {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        title: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }
    : {};

  const [data, total] = await Promise.all([
    this.prisma.movie.findMany({
      where,
      skip,
      take: limit,
      include: { genres: true },
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.movie.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
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