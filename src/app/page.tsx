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
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-8 pb-6 border-b border-slate-800/80">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                REELogue
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                v1.0
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Your watch history, beautifully told.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            + Add Movie
          </button>
        </header>

        {/* Search Bar & Status Tabs */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
            <input
              type="text"
              placeholder="Search movies by title..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/60 transition"
            />
          </div>

          <div className="flex gap-2">
            {(['ALL', 'TO_WATCH', 'WATCHED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {tab === 'ALL' ? 'All Movies' : tab === 'TO_WATCH' ? 'To Watch' : 'Watched'}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Display & Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-48 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-5 bg-slate-800 rounded w-2/3"></div>
                  <div className="h-4 bg-slate-800/60 rounded w-1/3"></div>
                </div>
                <div className="h-4 bg-slate-800/60 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 bg-red-950/40 border border-red-800/80 rounded-xl text-red-300 text-sm">
            🚨 {error}
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-xl border border-slate-800/80 text-slate-400">
            No movies found matching your criteria.
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
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-800/80">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="px-4 py-2 bg-slate-900/60 border border-slate-800 text-slate-200 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-800 transition"
          >
            Previous
          </button>
          <span className="text-sm text-slate-400 font-medium">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-2 bg-slate-900/60 border border-slate-800 text-slate-200 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-800 transition"
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