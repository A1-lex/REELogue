import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WatchStatus, Prisma } from '@prisma/client';
import { CreateMovieDto } from './dto/create-movie.dto';

@Injectable()
export class MoviesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateMovieDto) {
    const { genreIds, clientRequestId, ...movieData } = dto;
    const include = { genres: true } as const;

    if (!clientRequestId) {
      return this.prisma.movie.create({
        data: {
          ...movieData,
          user: { connect: { id: userId } },
          genres: { connect: genreIds.map((id) => ({ id })) },
        },
        include,
      });
    }

    return this.prisma.movie.upsert({
      where: {
        userId_clientRequestId: { userId, clientRequestId },
      },
      update: {},
      create: {
        ...movieData,
        clientRequestId,
        user: { connect: { id: userId } },
        genres: { connect: genreIds.map((id) => ({ id })) },
      },
      include,
    });
  }

  async findAll(
    userId: number,
    page: number = 1,
    limit: number = 6,
    search?: string,
    status?: WatchStatus,
    genreId?: number,
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.MovieWhereInput = { userId };

    if (search && search.trim() !== '') {
      where.title = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }

    if (status) {
      where.status = status;
    }

    if (genreId) {
      where.genres = {
        some: { id: genreId },
      };
    }

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
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async updateStatus(userId: number, id: number, status: WatchStatus) {
    const movie = await this.prisma.movie.findFirst({
      where: { id, userId },
    });

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }

    return this.prisma.movie.update({
      where: { id },
      data: { status },
      include: { genres: true },
    });
  }

  async remove(userId: number, id: number) {
    const movie = await this.prisma.movie.findFirst({
      where: { id, userId },
    });

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }

    return this.prisma.movie.delete({ where: { id } });
  }
}