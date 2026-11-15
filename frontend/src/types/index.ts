export interface Genre {
  id: number;
  name: string;
  createdAt: string;
}

export type MovieStatus = 'TO_WATCH' | 'WATCHED';
export type MovieSyncState = 'SYNCED' | 'PENDING_CREATE' | 'SYNC_FAILED';

export interface Movie {
  id: number | string;
  title: string;
  description?: string;
  status: MovieStatus;
  rating?: number;
  trailerUrl?: string;
  genres?: Genre[];
  createdAt: string;
  updatedAt: string;
  syncState?: MovieSyncState;
}

export interface CreateMoviePayload {
  clientRequestId?: string;
  title: string;
  description?: string;
  status: MovieStatus;
  rating?: number;
  trailerUrl?: string;
  genreIds: number[];
}

