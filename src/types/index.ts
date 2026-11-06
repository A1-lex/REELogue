export interface Genre {
    id: number;
    name: string;
    createdAt: string;
}

export type MovieStatus = 'TO_WATCH' | 'WATCHED'

export interface Movie {
    id: number;
    title: string;
    description?: string;
    status: MovieStatus;
    rating?: number;
    trailerUrl?: string;
    genreId: number;
    genre?: Genre;
    createdAt: string;
    updatedAt: string;
}

export interface CreateMoviePayload {
    title: string;
    description?: string;
    status: MovieStatus;
    rating?: number;
    trailerUrl?: string;
    genreId: number;
}