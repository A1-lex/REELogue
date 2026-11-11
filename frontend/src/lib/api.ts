import { Movie, Genre, CreateMoviePayload, MovieStatus } from '@/types';

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
  meta: { totalPages: number; [key: string]: unknown };
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

  const res = await fetch(`${API_BASE_URL}/movies?${params}`, { signal });

  if (!res.ok) {
    throw new Error(`Failed to fetch movies (${res.status})`);
  }

  return res.json();
}

export async function fetchGenres(): Promise<Genre[]> {
  const res = await fetch(`${API_BASE_URL}/genres`);
  if (!res.ok) throw new Error('Failed to fetch genres');
  return res.json();
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