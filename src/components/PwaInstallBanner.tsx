'use client';

import { useState } from 'react';
import { usePwaInstall } from '@/hooks/usePwaInstall';

export default function PwaInstallBanner() {
  const { isInstallable, installPwa } = usePwaInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-900/90 to-purple-900/90 backdrop-blur-md border-b border-indigo-500/30 text-white px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs shadow-inner">
            R
          </div>
          <p className="text-xs sm:text-sm font-medium">
            Install <span className="font-bold">REELogue</span> for an offline-ready experience.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={installPwa}
            className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold rounded-lg transition shadow-md"
          >
            Install App
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-white text-xs px-2 py-1"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}