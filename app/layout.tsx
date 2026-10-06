import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Newsreader, Schibsted_Grotesk } from 'next/font/google';
import './globals.css';
import { PROFILE } from '@/lib/data';

// Newsreader is variable on both weight and optical size; leaving `weight`
// out pulls the whole axis so display sizes get the high-contrast cut.
const serif = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-serif-face',
  display: 'swap',
});

const sans = Schibsted_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans-face',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono-face',
  display: 'swap',
});

// An "S" set in the serif, on paper, with the orange full stop.
const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E" +
  "%3Crect width='32' height='32' rx='7' fill='%23161513'/%3E" +
  "%3Ctext x='14' y='24' font-family='Georgia,serif' font-size='22' text-anchor='middle' fill='%23efece5'%3ES%3C/text%3E" +
  "%3Ccircle cx='24.5' cy='22.2' r='2.4' fill='%23dd4a1c'/%3E%3C/svg%3E";

const DESCRIPTION =
  'AI/ML and data engineer building agentic systems, LLM tooling, data pipelines and applied deep learning — from raw data to the device in someone’s hand.';

export const metadata: Metadata = {
  metadataBase: new URL('https://tendool.me'),
  title: `${PROFILE.full} — AI/ML & Data Engineer`,
  description: DESCRIPTION,
  keywords: [
    'AI Engineer',
    'Data Engineer',
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
    title: `${PROFILE.full} — AI/ML & Data Engineer`,
    description: DESCRIPTION,
    url: 'https://tendool.me',
    siteName: PROFILE.full,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${PROFILE.full} — AI/ML & Data Engineer`,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#efece5' },
    { media: '(prefers-color-scheme: dark)', color: '#11110f' },
  ],
  width: 'device-width',
  initialScale: 1,
};

/**
 * Runs before first paint: picks the theme (saved choice, else the system's)
 * and flags that JS is on, so reveal-on-scroll styles only ever hide content
 * that a script is actually going to show again.
 */
const BOOT = `(function(){var d=document.documentElement;d.classList.add('js');var t;try{t=localStorage.getItem('theme')}catch(e){}if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}d.dataset.theme=t})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
