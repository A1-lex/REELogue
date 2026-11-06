'use client';

import { useEffect, useState } from 'react';
import { Genre, MovieStatus } from '@/types';
import { fetchGenres, createMovie } from '@/lib/api';

interface AddMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMovieAdded: () => void;
}

export default function AddMovieModal({ isOpen, onClose, onMovieAdded }: AddMovieModalProps) {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<MovieStatus>('TO_WATCH');
  const [rating, setRating] = useState<number>(5);
  const [trailerUrl, setTrailerUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadGenres();
    }
  }, [isOpen]);

  async function loadGenres() {
    try {
      const data = await fetchGenres();
      setGenres(data);
      if (data.length > 0 && selectedGenreIds.length === 0) {
        setSelectedGenreIds([data[0].id]);
      }
    } catch (err: any) {
      setError('Failed to fetch genres for selection.');
    }
  }

  function toggleGenre(id: number) {
    if (selectedGenreIds.includes(id)) {
      if (selectedGenreIds.length === 1) return; // keep at least 1 selected
      setSelectedGenreIds(selectedGenreIds.filter((gId) => gId !== id));
    } else {
      setSelectedGenreIds([...selectedGenreIds, id]);
    }
  }

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || selectedGenreIds.length === 0) {
      setError('Title and at least one Genre are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await createMovie({
        title,
        description: description || undefined,
        status,
        rating: Number(rating),
        trailerUrl: trailerUrl || undefined,
        genreIds: selectedGenreIds,
      });

      setTitle('');
      setDescription('');
      setTrailerUrl('');
      onMovieAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add movie');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Add New Movie</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Movie Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Inception"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Genres (Select one or more) *
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {genres.map((g) => {
                const isSelected = selectedGenreIds.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGenre(g.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {g.name} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MovieStatus)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="TO_WATCH">To Watch</option>
                <option value="WATCHED">Watched</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Rating (1-5 Stars)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Trailer URL
            </label>
            <input
              type="url"
              value={trailerUrl}
              onChange={(e) => setTrailerUrl(e.target.value)}
              placeholder="https://youtube.com/..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg shadow transition disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add Movie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}