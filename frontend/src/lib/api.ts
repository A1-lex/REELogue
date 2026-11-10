import { Movie, Genre, CreateMoviePayload, MovieStatus } from '@/types';

const API_BASE_URL = 'http://localhost:3000';

export async function fetchMovies(
  page: number = 1,
  limit: number = 6,
  search?: string
): Promise<{ data: Movie[]; meta: any }> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) {
    params.append('search', search);
  }

  const res = await fetch(`${API_BASE_URL}/movies?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch movies');
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
  const res = await fetch(`http://localhost:3000/movies/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete movie');
}

export async function updateMovieStatus(id: number, status: MovieStatus): Promise<Movie> {
  const res = await fetch(`http://localhost:3000/movies/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update movie status');
  return await res.json();
}