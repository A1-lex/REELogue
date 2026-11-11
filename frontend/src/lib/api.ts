import { Movie, Genre, CreateMoviePayload, MovieStatus } from '@/types';
import {
  cacheGenres,
  cacheMovies,
  getCachedGenres,
  getCachedMovies,
} from '@/lib/offline-db';

// Strip a trailing slash so we never build URLs like "...com//movies"
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');

export interface MovieQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: MovieStatus;
}

export interface PaginatedMovies {
  data: Movie[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    offline?: boolean;
  };
}

export async function fetchMovies(
  { page = 1, limit = 6, search, status }: MovieQuery = {},
  signal?: AbortSignal,
): Promise<PaginatedMovies> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const trimmed = search?.trim();

  if (trimmed) params.append('search', trimmed);
  if (status) params.append('status', status);

  try {
    const res = await fetch(`${API_BASE_URL}/movies?${params}`, { signal });

    if (!res.ok) {
      throw new Error(`Failed to fetch movies (${res.status})`);
    }

    const result: PaginatedMovies = await res.json();

    await cacheMovies(result.data);

    return result;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }

    let movies = await getCachedMovies();

    if (trimmed) {
      const query = trimmed.toLowerCase();
      movies = movies.filter((movie) =>
        movie.title.toLowerCase().includes(query),
      );
    }

    if (status) {
      movies = movies.filter((movie) => movie.status === status);
    }

    const total = movies.length;
    const start = (page - 1) * limit;

    return {
      data: movies.slice(start, start + limit),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        offline: true,
      },
    };
  }
}

export async function fetchGenres(): Promise<Genre[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/genres`);

    if (!res.ok) {
      throw new Error(`Failed to fetch genres (${res.status})`);
    }

    const genres: Genre[] = await res.json();
    await cacheGenres(genres);

    return genres;
  } catch {
    return getCachedGenres();
  }
}

export async function createMovie(payload: CreateMoviePayload): Promise<Movie> {
  const res = await fetch(`${API_BASE_URL}/movies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create movie');
  return res.json();
}

export async function deleteMovie(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/movies/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete movie');
}

export async function updateMovieStatus(id: number, status: MovieStatus): Promise<Movie> {
  const res = await fetch(`${API_BASE_URL}/movies/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update movie status');
  return res.json();
}