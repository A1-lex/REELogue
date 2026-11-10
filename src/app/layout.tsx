import type { Metadata, Viewport } from 'next';
import './globals.css';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import PwaInstallBanner from '@/components/PwaInstallBanner';

export const metadata: Metadata = {
  applicationName: 'REELogue',
  title: 'REELogue | Your Watch History, Beautifully Told',
  description: 'Track your movie watchlist, multi-genre collections, and trailers in a sleek glassmorphic journal.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    title: 'REELogue',
    statusBarStyle: 'black-translucent',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#080A24',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500/30">
        <PwaInstallBanner />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}