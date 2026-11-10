'use client';

import { useEffect, useState } from 'react';
import { Movie, MovieStatus, Genre } from '@/types';
import { fetchMovies, fetchGenres, deleteMovie, updateMovieStatus } from '@/lib/api';
import MovieCard from '@/components/MovieCard';
import AddMovieModal from '@/components/AddMovieModal';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination & Filters state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenreId, setSelectedGenreId] = useState<number | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<MovieStatus | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Load genres on mount
  useEffect(() => {
    fetchGenres().then(setGenres).catch(() => {});
  }, []);

  async function loadMovies(page = 1, search = searchQuery) {
    try {
      setLoading(true);
      const res = await fetchMovies(page, 6, search);
      setMovies(res.data);
      setTotalPages(res.meta.totalPages);
      setCurrentPage(res.meta.page);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMovies(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  async function handleDelete(id: number) {
    try {
      await deleteMovie(id);
      loadMovies(currentPage, searchQuery);
    } catch (err: any) {
      alert('Failed to delete movie');
    }
  }

  async function handleStatusChange(id: number, newStatus: MovieStatus) {
    try {
      await updateMovieStatus(id, newStatus);
      loadMovies(currentPage, searchQuery);
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
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                REELogue
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium tracking-normal">
                v1.0
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Your watch history, beautifully told.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl shadow-lg transition"
          >
            + Add Movie
          </button>
        </header>

        {/* Search Bar & Status Tabs */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="Search movies by title..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

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
        </div>

        {/* Grid Display */}
        {loading ? (
          <div className="text-center py-16 text-slate-500">Loading movies...</div>
        ) : error ? (
          <div className="p-4 bg-red-950/50 border border-red-800 rounded-lg text-red-300 text-sm">🚨 {error}</div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/40 rounded-xl border border-slate-800 text-slate-400">
            No movies found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-800">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg text-sm disabled:opacity-50 hover:bg-slate-700 transition"
          >
            Previous
          </button>
          <span className="text-sm text-slate-400">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg text-sm disabled:opacity-50 hover:bg-slate-700 transition"
          >
            Next
          </button>
        </div>
      </div>

      <AddMovieModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMovieAdded={() => loadMovies(currentPage, searchQuery)}
      />
    </main>
  );
}