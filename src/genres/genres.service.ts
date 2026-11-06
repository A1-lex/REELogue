import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Genre } from '@prisma/client';

@Injectable()
export class GenresService {
    constructor(private prisma: PrismaService) {}

    //fetch all genres from the database
    async getAllGenres(): Promise<Genre[]> {
        return this.prisma.genre.findMany();
    }

    // create a new genre in the database
    async create(name: string): Promise<Genre> {
        return this.prisma.genre.create({
            data: {
                name,
            },
        });
    }
}
