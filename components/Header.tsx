'use client';

import { useEffect, useState } from 'react';
import { NAV, PROFILE } from '@/lib/data';
import LocalTime from './LocalTime';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const [active, setActive] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // The section crossing the middle of the viewport is the one being read.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-45% 0px -54% 0px' },
    );
    NAV.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    const top = document.getElementById('top');
    if (top) io.observe(top);

    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300 ${
        scrolled || open ? 'border-b border-rule bg-paper' : 'border-b border-transparent'
      }`}
    >
      <div className="wrap flex h-16 items-center justify-between gap-6">
        <a href="#top" className="serif text-[1.15rem] leading-none tracking-[-0.01em]" onClick={() => setOpen(false)}>
          {PROFILE.full}
        </a>

        <nav aria-label="Sections" className="hidden md:block">
          <ul className="flex items-center gap-7 text-[.92rem]">
            {NAV.map((n) => {
              const on = active === n.id;
              return (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    aria-current={on ? 'true' : undefined}
                    className={`relative transition-colors duration-200 ${on ? 'text-ink' : 'text-soft hover:text-ink'}`}
                  >
                    <span
                      aria-hidden
                      className={`absolute -left-3 top-1/2 h-[5px] w-[5px] -translate-y-1/2 rounded-full bg-accent transition-opacity duration-300 ${
                        on ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                    {n.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <span className="meta hidden lg:inline">
            Bobbili <LocalTime className="text-ink" />
          </span>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="h-9 rounded-full px-3 text-[.92rem] hover:bg-ink/[.06] md:hidden"
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Sections"
          className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto bg-paper md:hidden"
        >
          <ul className="wrap flex flex-col pt-6">
            {NAV.map((n, i) => (
              <li key={n.id} className="border-b border-rule">
                <a
                  href={`#${n.id}`}
                  onClick={() => setOpen(false)}
                  className="fade-in flex items-baseline justify-between py-4"
                  style={{ ['--d' as string]: `${i * 0.04}s` }}
                >
                  <span className="serif text-[2.2rem] leading-tight">{n.label}</span>
                  <span className="meta">{String(i + 1).padStart(2, '0')}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="wrap mt-8 flex flex-col gap-2 pb-10">
            <a href={`mailto:${PROFILE.email}`} className="link self-start">
              {PROFILE.email}
            </a>
            <span className="meta">
              Bobbili, local time <LocalTime className="text-ink" />
            </span>
          </div>
        </nav>
      )}
    </header>
  );
}
