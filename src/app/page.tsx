'use client';

import { useEffect, useState } from 'react';
import { Movie, MovieStatus } from '@/types';
import { fetchMovies, deleteMovie, updateMovieStatus } from '@/lib/api';
import MovieCard from '@/components/MovieCard';
import AddMovieModal from '@/components/AddMovieModal';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<MovieStatus | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function loadMovies() {
    try {
      setLoading(true);
      const data = await fetchMovies();
      setMovies(data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMovies();
  }, []);

  async function handleDelete(id: number) {
    try {
      await deleteMovie(id);
      setMovies((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      alert('Failed to delete movie');
    }
  }

  async function handleStatusChange(id: number, newStatus: MovieStatus) {
    try {
      const updated = await updateMovieStatus(id, newStatus);
      setMovies((prev) => prev.map((m) => (m.id === id ? updated : m)));
    } catch (err: any) {
      alert('Failed to update movie status');
    }
  }

  const filteredMovies = movies.filter((movie) => {
    if (activeTab === 'ALL') return true;
    return movie.status === activeTab;
  });

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-slate-800 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              🎬 Watched Movies Tracker
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Keep track of your watchlist and favorite genres.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg transition flex items-center gap-2"
          >
            <span>+ Add Movie</span>
          </button>
        </header>

        {/* Filter Navigation Tabs */}
        <div className="flex gap-2 mb-6">
          {(['ALL', 'TO_WATCH', 'WATCHED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {tab === 'ALL' && `All (${movies.length})`}
              {tab === 'TO_WATCH' &&
                `To Watch (${movies.filter((m) => m.status === 'TO_WATCH').length})`}
              {tab === 'WATCHED' &&
                `Watched (${movies.filter((m) => m.status === 'WATCHED').length})`}
            </button>
          ))}
        </div>

        {/* Content Area */}
        {loading && (
          <div className="text-center py-16 text-slate-500">
            Loading movies from NestJS backend...
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-950/50 border border-red-800 rounded-lg text-red-300 text-sm">
            🚨 Error: {error}. Make sure your backend server is running on `http://localhost:3000`.
          </div>
        )}

        {!loading && !error && filteredMovies.length === 0 && (
          <div className="text-center py-16 bg-slate-800/40 rounded-xl border border-slate-800">
            <p className="text-slate-400 mb-1">No movies found in this list.</p>
          </div>
        )}

        {!loading && !error && filteredMovies.length > 0 && (
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
      </div>

      <AddMovieModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMovieAdded={loadMovies}
      />
    </main>
  );
}