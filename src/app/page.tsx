'use client';

import { useEffect, useState } from 'react';
import { Movie, MovieStatus, Genre } from '@/types';
import { fetchMovies, deleteMovie, updateMovieStatus } from '@/lib/api';
import MovieCard from '@/components/MovieCard';
import AddMovieModal from '@/components/AddMovieModal';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenreId, setSelectedGenreId] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<MovieStatus | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch genres once on mount
  useEffect(() => {
    fetch('http://localhost:3000/genres')
      .then((res) => res.json())
      .then((data) => setGenres(data))
      .catch((err) => console.error('Failed to load genres', err));
  }, []);

  async function loadMovies(currentPage = 1, genreId = selectedGenreId) {
    try {
      setLoading(true);
      const res = await fetchMovies(currentPage, 6, genreId);
      setMovies(res.data);
      setTotalPages(res.meta.totalPages);
      setPage(res.meta.page);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMovies(page, selectedGenreId);
  }, [page, selectedGenreId]);

  async function handleDelete(id: number) {
    try {
      await deleteMovie(id);
      loadMovies(page, selectedGenreId);
    } catch (err: any) {
      alert('Failed to delete movie');
    }
  }

  async function handleStatusChange(id: number, newStatus: MovieStatus) {
    try {
      await updateMovieStatus(id, newStatus);
      loadMovies(page, selectedGenreId);
    } catch (err: any) {
      alert('Failed to update status');
    }
  }

  const filteredMovies = movies.filter((movie) => {
    if (activeTab === 'ALL') return true;
    return movie.status === activeTab;
  });

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-extrabold text-white">🎬 Watched Movies Tracker</h1>
            <p className="text-slate-400 text-sm mt-1">Keep track of your watchlist and favorite genres.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl shadow-lg transition"
          >
            + Add Movie
          </button>
        </header>

        {/* Status Tabs & Genre Filters */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex gap-2">
            {(['ALL', 'TO_WATCH', 'WATCHED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Genre Filter Pills */}
          {genres.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Genres:</span>
              <button
                onClick={() => { setSelectedGenreId(undefined); setPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  selectedGenreId === undefined
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                All Genres
              </button>
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => { setSelectedGenreId(genre.id); setPage(1); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    selectedGenreId === genre.id
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onDelete={handleDelete} onStatusChange={handleStatusChange} />
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-800">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg text-sm disabled:opacity-50 hover:bg-slate-700 transition"
          >
            Previous
          </button>
          <span className="text-sm text-slate-400">
            Page {page} of {totalPages || 1}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg text-sm disabled:opacity-50 hover:bg-slate-700 transition"
          >
            Next
          </button>
        </div>
      </div>

      <AddMovieModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onMovieAdded={() => loadMovies(page, selectedGenreId)} />
    </main>
  );
}