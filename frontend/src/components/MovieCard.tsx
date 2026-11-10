'use client';

import { useState } from 'react';
import { Movie, MovieStatus } from '@/types';
import TrailerModal from '@/components/TrailerModal';

interface MovieCardProps {
  movie: Movie;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, newStatus: MovieStatus) => void;
}

export default function MovieCard({ movie, onDelete, onStatusChange }: MovieCardProps) {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const nextStatus = movie.status === 'WATCHED' ? 'TO_WATCH' : 'WATCHED';

  return (
    <>
      <div className="relative bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-500 transition">
        {/* Delete Confirmation Overlay */}
        {isConfirmingDelete && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm rounded-xl z-20 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <p className="text-sm font-semibold text-white mb-2">Delete &quot;{movie.title}&quot;?</p>
            <p className="text-xs text-slate-400 mb-4">This action cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onDelete(movie.id);
                  setIsConfirmingDelete(false);
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-white">{movie.title}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onStatusChange(movie.id, nextStatus)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-full transition cursor-pointer ${
                  movie.status === 'WATCHED'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900'
                    : 'bg-amber-950 text-amber-400 border border-amber-800 hover:bg-amber-900'
                }`}
                title="Click to toggle watch status"
              >
                {movie.status === 'WATCHED' ? 'Watched' : 'To Watch'}
              </button>
              <button
                onClick={() => setIsConfirmingDelete(true)}
                className="text-slate-500 hover:text-red-400 text-xs px-1.5 py-0.5 rounded transition"
                title="Delete movie"
              >
                ✕
              </button>
            </div>
          </div>

          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {movie.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs px-2.5 py-0.5 rounded-md"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          {movie.description && (
            <p className="text-slate-400 text-sm mb-4 line-clamp-3">
              {movie.description}
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-slate-700/60 flex justify-between items-center text-sm">
          {movie.rating ? (
            <div className="text-amber-400 font-medium">
              {'★'.repeat(movie.rating)}
              <span className="text-slate-600">{'★'.repeat(5 - movie.rating)}</span>
            </div>
          ) : (
            <span className="text-slate-500 text-xs">Unrated</span>
          )}

          {movie.trailerUrl && (
            <button
              onClick={() => setIsTrailerOpen(true)}
              className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-1 transition"
            >
              ▶ Watch Trailer
            </button>
          )}
        </div>
      </div>

      <TrailerModal
        isOpen={isTrailerOpen}
        trailerUrl={movie.trailerUrl}
        movieTitle={movie.title}
        onClose={() => setIsTrailerOpen(false)}
      />
    </>
  );
}