'use client';

import { useEffect, useState } from 'react';
import { NAV } from '@/lib/data';
import { flight } from '@/lib/flight';
import Magnetic from './Magnetic';
import Logo from './Logo';

export default function Nav() {
  const [active, setActive] = useState('hero');
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const ids = [...NAV.map((n) => n.id), 'contact'];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    // Track the section occupying the middle band of the viewport rather than
    // whichever one merely intersects — that matches what is being read.
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          setActive(visible.target.id);
          flight.section = ids.indexOf(visible.target.id);
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    );
    sections.forEach((s) => io.observe(s));

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      {/* Flight progress — how far down the corridor you have travelled. */}
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-accent"
        style={{ transform: `scaleX(${progress})`, boxShadow: '0 0 10px rgba(139,92,246,.7)' }}
      />

      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-5">
        <div className="glass mx-auto flex max-w-[1320px] items-center justify-between gap-4 !rounded-full py-2.5 pl-5 pr-2.5">
          <Logo />

          <nav className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    aria-current={active === n.id ? 'page' : undefined}
                    className={`font-mono block rounded-full px-3.5 py-2 text-[.68rem] uppercase tracking-[.1em] transition-colors duration-300 ${
                      active === n.id
                        ? 'bg-accent/15 text-accent'
                        : 'text-paper/55 hover:bg-white/5 hover:text-paper'
                    }`}
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <Magnetic strength={0.25}>
                <a href="#contact" className="btn btn-accent !px-5 !py-2.5 !text-[.66rem]">
                  Contact
                </a>
              </Magnetic>
            </div>
            <button
              onClick={() => setOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-paper lg:hidden"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <div className="glass mx-auto mt-2 max-w-[1320px] p-3 lg:hidden">
            <ul className="flex flex-col">
              {[...NAV, { id: 'contact', label: 'Contact' }].map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    onClick={() => setOpen(false)}
                    className={`font-mono block rounded-2xl px-4 py-3 text-[.74rem] uppercase tracking-[.1em] transition-colors ${
                      active === n.id ? 'bg-accent/15 text-accent' : 'text-paper/65'
                    }`}
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>
    </>
  );
}
