import type { Metadata, Viewport } from 'next';
import { Sora, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sora',
  weight: ['400', '500', '600', '700'],
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plex-mono',
  weight: ['400', '500', '600'],
});

export const viewport: Viewport = {
  themeColor: '#0b0d12',
};

export const metadata: Metadata = {
  title: 'AI Study Assistant — Calm, Focused Learning',
  description:
    'Turn raw notes into mindmaps, explanations, and practice questions with a calm, focused study workspace for CSE students.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sora.variable} ${plexMono.variable}`}>
      <body className="app-body">
        <main className="app-main">{children}</main>
      </body>
    </html>
  );
}
