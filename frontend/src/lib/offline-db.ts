import { CreateMoviePayload, Genre, Movie } from '@/types';

const DB_NAME = 'reelogue-db';
const DB_VERSION = 2;
const MOVIES_STORE = 'movies';
const GENRES_STORE = 'genres';
const PENDING_CREATES_STORE = 'pendingCreates';

export interface PendingMovieCreate {
  localId: string;
  payload: CreateMoviePayload;
  queuedAt: string;
  attempts: number;
  lastError?: string;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(MOVIES_STORE)) {
        db.createObjectStore(MOVIES_STORE, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(GENRES_STORE)) {
        db.createObjectStore(GENRES_STORE, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(PENDING_CREATES_STORE)) {
        db.createObjectStore(PENDING_CREATES_STORE, { keyPath: 'localId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
    console.error('Failed to open REELogue IndexedDB:', request.error);
    reject(request.error);
    };

    request.onblocked = () => {
    console.warn(
        'REELogue IndexedDB upgrade is blocked. Close other REELogue tabs and reload.',
    );
    };
  });
}

export async function cacheMovies(movies: Movie[]): Promise<void> {
  const db = await openDb();
  const transaction = db.transaction(MOVIES_STORE, 'readwrite');
  const store = transaction.objectStore(MOVIES_STORE);

  movies.forEach((movie) => {
    store.put({ ...movie, syncState: movie.syncState ?? 'SYNCED' });
  });

  await transactionComplete(transaction);
  db.close();
}

export async function putCachedMovie(movie: Movie): Promise<void> {
  const db = await openDb();
  const transaction = db.transaction(MOVIES_STORE, 'readwrite');
  transaction.objectStore(MOVIES_STORE).put(movie);
  await transactionComplete(transaction);
  db.close();
}

export async function deleteCachedMovie(id: number | string): Promise<void> {
  const db = await openDb();
  const transaction = db.transaction(MOVIES_STORE, 'readwrite');
  transaction.objectStore(MOVIES_STORE).delete(id);
  await transactionComplete(transaction);
  db.close();
}

export async function getCachedMovies(): Promise<Movie[]> {
  const db = await openDb();
  const transaction = db.transaction(MOVIES_STORE, 'readonly');
  const request = transaction.objectStore(MOVIES_STORE).getAll();
  const movies = await requestResult<Movie[]>(request);
  await transactionComplete(transaction);
  db.close();

  return movies.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function cacheGenres(genres: Genre[]): Promise<void> {
  const db = await openDb();
  const transaction = db.transaction(GENRES_STORE, 'readwrite');
  const store = transaction.objectStore(GENRES_STORE);
  genres.forEach((genre) => store.put(genre));
  await transactionComplete(transaction);
  db.close();
}

export async function getCachedGenres(): Promise<Genre[]> {
  const db = await openDb();
  const transaction = db.transaction(GENRES_STORE, 'readonly');
  const request = transaction.objectStore(GENRES_STORE).getAll();
  const genres = await requestResult<Genre[]>(request);
  await transactionComplete(transaction);
  db.close();
  return genres.sort((a, b) => a.name.localeCompare(b.name));
}

export async function queueMovieCreate(
  payload: CreateMoviePayload,
): Promise<Movie> {
  const genres = await getCachedGenres();
  const now = new Date().toISOString();
  const localId = `local-${crypto.randomUUID()}`;

  const localMovie: Movie = {
    id: localId,
    title: payload.title,
    description: payload.description,
    status: payload.status,
    rating: payload.rating,
    trailerUrl: payload.trailerUrl,
    genres: genres.filter((genre) => payload.genreIds.includes(genre.id)),
    createdAt: now,
    updatedAt: now,
    syncState: 'PENDING_CREATE',
  };

  const pending: PendingMovieCreate = {
    localId,
    payload,
    queuedAt: now,
    attempts: 0,
  };

  const db = await openDb();
  const transaction = db.transaction(
    [MOVIES_STORE, PENDING_CREATES_STORE],
    'readwrite',
  );

  transaction.objectStore(MOVIES_STORE).put(localMovie);
  transaction.objectStore(PENDING_CREATES_STORE).put(pending);

  await transactionComplete(transaction);
  db.close();
  return localMovie;
}

export async function getPendingMovieCreates(): Promise<PendingMovieCreate[]> {
  const db = await openDb();
  const transaction = db.transaction(PENDING_CREATES_STORE, 'readonly');
  const request = transaction.objectStore(PENDING_CREATES_STORE).getAll();
  const pending = await requestResult<PendingMovieCreate[]>(request);
  await transactionComplete(transaction);
  db.close();
  return pending.sort((a, b) => a.queuedAt.localeCompare(b.queuedAt));
}

export async function completePendingMovieCreate(
  localId: string,
  serverMovie: Movie,
): Promise<void> {
  const db = await openDb();
  const transaction = db.transaction(
    [MOVIES_STORE, PENDING_CREATES_STORE],
    'readwrite',
  );

  const movieStore = transaction.objectStore(MOVIES_STORE);
  movieStore.delete(localId);
  movieStore.put({ ...serverMovie, syncState: 'SYNCED' });
  transaction.objectStore(PENDING_CREATES_STORE).delete(localId);

  await transactionComplete(transaction);
  db.close();
}

export async function markPendingMovieCreateFailed(
  pending: PendingMovieCreate,
  message: string,
): Promise<void> {
  const db = await openDb();
  const transaction = db.transaction(
    [MOVIES_STORE, PENDING_CREATES_STORE],
    'readwrite',
  );

  transaction.objectStore(PENDING_CREATES_STORE).put({
    ...pending,
    attempts: pending.attempts + 1,
    lastError: message,
  });

  const movieStore = transaction.objectStore(MOVIES_STORE);
  const request = movieStore.get(pending.localId);

  request.onsuccess = () => {
    if (request.result) {
      movieStore.put({ ...request.result, syncState: 'SYNC_FAILED' });
    }
  };

  await transactionComplete(transaction);
  db.close();
}

export async function replaceServerMovieSnapshot(
  serverMovies: Movie[],
): Promise<void> {
  const db = await openDb();
  const transaction = db.transaction(MOVIES_STORE, 'readwrite');
  const store = transaction.objectStore(MOVIES_STORE);
  const existingRequest = store.getAll();
  const existing = await requestResult<Movie[]>(existingRequest);

  const localMovies = existing.filter(
    (movie) =>
      typeof movie.id === 'string' &&
      (movie.syncState === 'PENDING_CREATE' ||
        movie.syncState === 'SYNC_FAILED'),
  );

  store.clear();

  serverMovies.forEach((movie) => {
    store.put({ ...movie, syncState: 'SYNCED' });
  });

  localMovies.forEach((movie) => store.put(movie));

  await transactionComplete(transaction);
  db.close();
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.error('IndexedDB request failed:', request.error);
      reject(request.error);
    };
  });
}

function transactionComplete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}