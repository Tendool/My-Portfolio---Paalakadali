'use client';

import { useEffect, useState } from 'react';
import { PROFILE } from '@/lib/data';

const fmt = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: PROFILE.timeZone,
});

/** The current time in Bobbili. Rendered client-side only, so it never mismatches. */
export default function LocalTime({ className = '' }: { className?: string }) {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <time className={`tabular-nums ${className}`} suppressHydrationWarning>
      {now ?? '--:--'}
    </time>
  );
}
