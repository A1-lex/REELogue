import { Controller, Get, Post, Body } from '@nestjs/common';
import { GenresService } from './genres.service';

@Controller('genres')
export class GenresController {
    constructor(private readonly genresService: GenresService) {}

    @Get()
    async getAllGenres() {
        return this.genresService.getAllGenres();
    }

    @Post()
    async createGenre(@Body('name') name: string) {
        return this.genresService.create(name);
    }
}
