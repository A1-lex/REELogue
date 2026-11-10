'use client';

import { getYouTubeEmbedUrl } from '@/lib/utils';

interface TrailerModalProps {
  isOpen: boolean;
  trailerUrl?: string;
  movieTitle: string;
  onClose: () => void;
}

export default function TrailerModal({ isOpen, trailerUrl, movieTitle, onClose }: TrailerModalProps) {
  if (!isOpen) return null;

  const embedUrl = getYouTubeEmbedUrl(trailerUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">Trailer: {movieTitle}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold px-2 py-1 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Video Frame */}
        <div className="relative aspect-video w-full bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={movieTitle}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              No valid trailer URL provided.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}