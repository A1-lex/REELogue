'use client';

import { useState, useEffect } from 'react';
import MovieCard from '@/components/MovieCard';
import AddMovieModal from '@/components/AddMovieModal';
import TrailerModal from '@/components/TrailerModal';
import { fetchMovies, deleteMovie, updateMovieStatus, fetchGenres } from '@/lib/api';
import { Movie, MovieStatus } from '@/types';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'TO_WATCH' | 'WATCHED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTrailer, setActiveTrailer] = useState<{ url: string; title: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const loadMovies = async (signal?: AbortSignal) => {
    setLoading(true);

    try {
      const res = await fetchMovies(
        {
          page: currentPage,
          search: searchQuery,
          status: activeTab === 'ALL' ? undefined : activeTab,
        },
        signal,
      );

      setMovies(res.data);
      setTotalPages(res.meta.totalPages || 1);
      setIsOffline(Boolean(res.meta.offline));
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      console.error('Failed to fetch movies:', err);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const updateNetworkStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    updateNetworkStatus();

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const timeoutId = window.setTimeout(() => {
      loadMovies(controller.signal);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchQuery, activeTab, currentPage]);

  useEffect(() => {
    fetchGenres().catch((error) => {
      console.error('Failed to prepare genres for offline use:', error);
    });
  }, []);

  const handleDelete = async (id: number | string) => {
    if (confirm('Are you sure you want to delete this movie?')) {
      await deleteMovie(Number(id));
      loadMovies();
    }
  };

  const handleStatusToggle = async (
    id: number | string,
    newStatus: MovieStatus,
  ) => {
    try {
      await updateMovieStatus(Number(id), newStatus);
      await loadMovies();
    } catch (error) {
      console.error('Failed to update movie status:', error);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 sm:px-6 py-6 pb-24 md:pb-8 max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex items-start justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              REELogue
            </h1>
            <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800/50 px-2 py-0.5 rounded-full font-mono">
              v1.0
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Your watch history, beautifully told.
          </p>
        </div>

        {/* Desktop Add Movie Action */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="hidden md:inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition"
        >
          <span>+</span> Add Movie
        </button>
      </header>


      {isOffline && (
        <div
          role="status"
          className="mb-4 rounded-xl border border-amber-700/50 bg-amber-950/50 px-4 py-3 text-xs text-amber-200"
        >
          You're offline. Showing saved data from your last sync. Some
          features require an internet connection.
        </div>
      )}

      {/* Search Bar & 3-Column Segmented Status Filters */}
      <section className="space-y-3 mb-6"></section>

      {/* Search Bar & 3-Column Segmented Status Filters */}
      <section className="space-y-3 mb-6">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
          <input
            type="search"
            placeholder="Search movies by title..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition"
          />
        </div>

        <div
          role="group"
          aria-label="Filter movies by viewing status"
          className="grid grid-cols-3 gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl"
        >
          {(['ALL', 'TO_WATCH', 'WATCHED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`min-h-[40px] px-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {tab === 'ALL' ? 'All' : tab === 'TO_WATCH' ? 'To Watch' : 'Watched'}
            </button>
          ))}
        </div>
      </section>

      {/* Movie Grid & Skeleton Loading */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-slate-900/40 border border-slate-800/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 border border-slate-800/50 rounded-2xl">
          <p className="text-slate-400 text-sm">No movies found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onDelete={handleDelete}
              onStatusChange={handleStatusToggle}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-800/60">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition"
          >
            Previous
          </button>
          <span className="text-xs text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition"
          >
            Next
          </button>
        </div>
      )}

      {/* Mobile Floating Action Button (FAB) */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        aria-label="Add Movie"
        className="fixed md:hidden right-4 bottom-[calc(env(safe-area-inset-bottom,0px)+1rem)] z-40 flex items-center gap-2 bg-indigo-600 active:bg-indigo-500 text-white text-sm font-semibold px-5 py-3.5 rounded-full shadow-2xl shadow-indigo-900/60 active:scale-95 transition"
      >
        <span className="text-base font-bold">+</span> Add Movie
      </button>

      {/* Modals */}
      <AddMovieModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onMovieAdded={loadMovies}
      />

      {activeTrailer && (
        <TrailerModal
          isOpen={!!activeTrailer}
          trailerUrl={activeTrailer.url}
          movieTitle={activeTrailer.title}
          onClose={() => setActiveTrailer(null)}
        />
      )}
    </main>
  );
}