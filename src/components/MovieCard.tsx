import { Movie, MovieStatus } from '@/types';

interface MovieCardProps {
  movie: Movie;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, newStatus: MovieStatus) => void;
}

export default function MovieCard({ movie, onDelete, onStatusChange }: MovieCardProps) {
  const nextStatus = movie.status === 'WATCHED' ? 'TO_WATCH' : 'WATCHED';

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-500 transition">
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
              onClick={() => onDelete(movie.id)}
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
          <a
            href={movie.trailerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold hover:underline flex items-center gap-1"
          >
            Watch Trailer ↗
          </a>
        )}
      </div>
    </div>
  );
}