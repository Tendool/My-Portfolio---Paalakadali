import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, IBM_Plex_Mono, Inter } from 'next/font/google';
import './globals.css';
import { QualityProvider } from '@/lib/quality';
import { PROFILE } from '@/lib/data';

// Bricolage Grotesque is a variable font; omitting `weight` pulls the whole
// wght axis so the headline scale can use 400–800 without extra requests.
const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display-face',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body-face',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono-face',
  display: 'swap',
});

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E" +
  "%3Crect width='40' height='40' rx='11' fill='%23F4F5F7'/%3E" +
  "%3Cpath d='M26.4 13.2c-1.5-1.9-4-3-6.6-2.8-3.3.2-5.9 2.3-5.8 4.9.1 2.5 2.4 3.7 5.9 4.5 3.5.8 5.8 2 5.9 4.5.1 2.6-2.5 4.7-5.8 4.9-2.6.2-5.1-.9-6.6-2.8' fill='none' stroke='%2305060A' stroke-width='3.4' stroke-linecap='round'/%3E" +
  "%3Cellipse cx='20' cy='20' rx='15.5' ry='6' fill='none' stroke='%23E10600' stroke-width='2.2' transform='rotate(-28 20 20)'/%3E" +
  "%3Ccircle cx='32.4' cy='13.4' r='3.1' fill='%23E10600'/%3E%3C/svg%3E";

export const metadata: Metadata = {
  metadataBase: new URL('https://tendool.me'),
  title: `${PROFILE.full} — AI/ML Engineer`,
  description:
    'AI/ML Engineer specializing in agentic AI, LLM systems, computer vision, and applied deep learning across healthcare, agriculture, robotics, and enterprise.',
  keywords: [
    'AI Engineer',
    'Machine Learning',
    'Agentic AI',
    'LLM',
    'RAG',
    'Computer Vision',
    'Quantum Machine Learning',
    'Deep Learning',
  ],
  authors: [{ name: PROFILE.full }],
  icons: { icon: FAVICON },
  openGraph: {
    title: `${PROFILE.full} — AI/ML Engineer`,
    description:
      'Agentic AI, LLM systems and applied deep learning — from data pipeline through to deployment.',
    url: 'https://tendool.me',
    siteName: PROFILE.full,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${PROFILE.full} — AI/ML Engineer`,
    description: 'Agentic AI, LLM systems and applied deep learning.',
  },
};

export const viewport: Viewport = {
  themeColor: '#05060a',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="text-paper antialiased">
        <QualityProvider>{children}</QualityProvider>
      </body>
    </html>
  );
}
