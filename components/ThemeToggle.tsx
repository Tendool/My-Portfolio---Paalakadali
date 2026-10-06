'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  }, []);

  const flip = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {}
    setTheme(next);
  };

  const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <button
      type="button"
      onClick={flip}
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 place-items-center rounded-full text-ink transition-colors hover:bg-ink/[.06] ${className}`}
    >
      {/* Half-filled disc: the filled half swaps sides with the theme. */}
      <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden>
        <circle cx="10" cy="10" r="7.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path
          d={theme === 'dark' ? 'M10 2.75a7.25 7.25 0 0 0 0 14.5z' : 'M10 2.75a7.25 7.25 0 0 1 0 14.5z'}
          fill="currentColor"
        />
      </svg>
    </button>
  );
}
