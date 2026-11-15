import { Movie, Genre, CreateMoviePayload, MovieStatus } from '@/types';
import {
  cacheGenres,
  cacheMovies,
  completePendingMovieCreate,
  getCachedGenres,
  getCachedMovies,
  getPendingMovieCreates,
  markPendingMovieCreateFailed,
  putCachedMovie,
  queueMovieCreate,
  replaceServerMovieSnapshot,
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

export async function createMovie(
  payload: CreateMoviePayload,
): Promise<Movie> {
  const requestPayload: CreateMoviePayload = {
    ...payload,
    clientRequestId: payload.clientRequestId ?? crypto.randomUUID(),
  };

  if (!navigator.onLine) {
    return queueMovieCreate(requestPayload);
  }

  try {
    const res = await fetch(`${API_BASE_URL}/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload),
    });

    if (!res.ok) {
      throw new Error(`Failed to create movie (${res.status})`);
    }

    const movie: Movie = await res.json();
    const syncedMovie = { ...movie, syncState: 'SYNCED' as const };
    await putCachedMovie(syncedMovie);
    return syncedMovie;
  } catch (error) {
    // Queue only network failures. HTTP 400/409 errors should remain visible.
    if (error instanceof TypeError) {
      return queueMovieCreate(requestPayload);
    }

    throw error;
  }
}

let pendingCreateSync: Promise<{ synced: number; failed: number }> | null = null;

async function runPendingMovieCreateSync(): Promise<{
  synced: number;
  failed: number;
}> {
  if (!navigator.onLine) {
    return { synced: 0, failed: 0 };
  }

  const pendingCreates = await getPendingMovieCreates();
  let synced = 0;
  let failed = 0;

  for (const pending of pendingCreates) {
    try {
      const res = await fetch(`${API_BASE_URL}/movies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pending.payload),
      });

      if (!res.ok) {
        throw new Error(`Sync failed (${res.status})`);
      }

      const serverMovie: Movie = await res.json();
      await completePendingMovieCreate(pending.localId, serverMovie);
      synced += 1;
    } catch (error) {
      console.error(
        `Failed to synchronize queued movie ${pending.localId}:`,
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : 'Unknown synchronization error';

      await markPendingMovieCreateFailed(pending, message);
      failed += 1;
    }
  }

  return { synced, failed };
}

export function syncPendingMovieCreates(): Promise<{
  synced: number;
  failed: number;
}> {
  if (pendingCreateSync) {
    return pendingCreateSync;
  }

  pendingCreateSync = runPendingMovieCreateSync().finally(() => {
    pendingCreateSync = null;
  });

  return pendingCreateSync;
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

export async function refreshOfflineMovieSnapshot(): Promise<number> {
  if (!navigator.onLine) return 0;

  const limit = 50;
  let page = 1;
  let totalPages = 1;
  const allMovies: Movie[] = [];

  do {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    const res = await fetch(`${API_BASE_URL}/movies?${params}`);

    if (!res.ok) {
      throw new Error(`Failed to refresh offline snapshot (${res.status})`);
    }

    const result: PaginatedMovies = await res.json();
    allMovies.push(...result.data);
    totalPages = result.meta.totalPages;
    page += 1;
  } while (page <= totalPages);

  await replaceServerMovieSnapshot(allMovies);
  return allMovies.length;
}