import { Genre, Movie } from '@/types';

const DB_NAME = 'reelogue-db';
const DB_VERSION = 1;
const MOVIES_STORE = 'movies';
const GENRES_STORE = 'genres';

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
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function cacheMovies(movies: Movie[]): Promise<void> {
  const db = await openDb();
  const transaction = db.transaction(MOVIES_STORE, 'readwrite');
  const store = transaction.objectStore(MOVIES_STORE);

  movies.forEach((movie) => store.put(movie));

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

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionComplete(
  transaction: IDBTransaction,
): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}