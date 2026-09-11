'use client';

import { useEffect, useRef } from 'react';

/**
 * A trailing ring and a leading dot.
 *
 * The dot tracks the pointer exactly; the ring lags behind and swells over
 * anything interactive. Both are written straight to `transform` inside one
 * rAF loop — no React renders, no layout, compositor only.
 *
 * Skipped entirely on coarse pointers and under reduced motion, and the real
 * cursor is only hidden once this is actually running, so a failure here can
 * never leave the page without a pointer.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || still) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.body.classList.add('has-cursor');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let raf = 0;

    const HOT = 'a, button, [role="button"], input, textarea, select, [data-cursor="hot"]';

    const onMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      const target = e.target as HTMLElement | null;
      ring.classList.toggle('is-hot', Boolean(target?.closest?.(HOT)));
    };

    const tick = () => {
      // Frame-rate independent chase, so the lag feels the same at 60 and 144.
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    // Hide while the pointer is outside the window, or a stale ring sits in the
    // corner whenever someone alt-tabs away.
    const onLeave = () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    };
    const onEnter = () => {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('pointerenter', onEnter);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('pointerenter', onEnter);
      document.body.classList.remove('has-cursor');
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden />
      <div ref={dotRef} className="cursor-dot" aria-hidden />
    </>
  );
}
