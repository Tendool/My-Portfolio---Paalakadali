'use client';

import { useEffect } from 'react';

/**
 * One observer for every `.rv` element on the page: each fades up once, the
 * first time it is a little way into the viewport. Server-rendered sections
 * only need the class, not a client wrapper.
 */
export default function RevealObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
    );
    document.querySelectorAll('.rv:not(.in)').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
