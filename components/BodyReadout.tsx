'use client';

import { useEffect, useRef, useState } from 'react';
import { flight } from '@/lib/flight';
import { nearestBody } from '@/lib/stations';

/**
 * Names the body the camera is currently passing.
 *
 * Polled on rAF but only committed to state when the name actually changes,
 * so this renders a handful of times across the whole page rather than every
 * frame. Hidden while between bodies, and while the hero is still on screen.
 */
export default function BodyReadout() {
  const [body, setBody] = useState<{ name: string; note: string } | null>(null);
  const lastName = useRef<string | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    const tick = () => {
      const found = nearestBody(flight.scroll);
      const name = found?.name ?? null;
      if (name !== lastName.current) {
        lastName.current = name;
        setBody(found && found.name ? { name: found.name, note: found.note ?? '' } : null);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed bottom-6 left-4 z-40 hidden transition-all duration-500 sm:left-6 md:block ${
        body ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      }`}
    >
      <div className="glass flex items-center gap-3.5 !rounded-full py-2.5 pl-4 pr-5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        <span className="font-mono text-[.72rem] uppercase tracking-[.14em] text-paper">
          {body?.name ?? ''}
        </span>
        <span className="h-3 w-px bg-white/15" />
        <span className="font-mono text-[.66rem] tracking-[.06em] text-paper/45">
          {body?.note ?? ''}
        </span>
      </div>
    </div>
  );
}
