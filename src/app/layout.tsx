import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'REELogue | Your Watch History, Beautifully Told',
  description: 'Track your movie watchlist, multi-genre collections, and trailers in a sleek glassmorphic journal.',
  manifest: '/manifest.json',
  icons: {
    icon: '/reelogue-svg.svg',
    apple: '/reelogue-svg.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500/30">
        {children}
      </body>
    </html>
  );
}