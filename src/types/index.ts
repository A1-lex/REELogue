export interface Genre {
  id: number;
  name: string;
  createdAt: string;
}

export type MovieStatus = 'TO_WATCH' | 'WATCHED';

export interface Movie {
  id: number;
  title: string;
  description?: string;
  status: MovieStatus;
  rating?: number;
  trailerUrl?: string;
  genres?: Genre[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMoviePayload {
  title: string;
  description?: string;
  status: MovieStatus;
  rating?: number;
  trailerUrl?: string;
  genreIds: number[];
}