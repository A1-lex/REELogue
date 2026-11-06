import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Movie } from '@prisma/client';
import { CreateMovieDto } from './dto/create-movie.dto';

@Injectable()
export class MoviesService {
    constructor(private prisma: PrismaService){}

    // Fetch all movies, including their associated Genre relation
    async findAll(): Promise<Movie[]> {
        return this.prisma.movie.findMany({
            include: { genre: true },
        });
    }

    // Create a new movie linked to a genre
    async create(createMovieDto: CreateMovieDto): Promise<Movie> {
        return this.prisma.movie.create({
            data: createMovieDto,
            include: { genre: true},
        })
    }
}
