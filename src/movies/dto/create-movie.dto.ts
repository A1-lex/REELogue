import { WatchStatus } from "@prisma/client";

export class CreateMovieDto {
    title: string;
    description?: string;
    status?: WatchStatus;
    rating?: number;
    trailerUrl: string;
    genreId: number;
}