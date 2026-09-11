'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';

/**
 * Pulls its child toward the pointer while the pointer is near.
 *
 * The offset is written to `transform` in a rAF loop that stops as soon as the
 * element has settled, so an idle page has no animation frames running for it.
 * Mouse only: on touch there is nothing to be magnetic toward, and dragging a
 * button around on tap just feels broken.
 */
export default function Magnetic({
  children,
  className = '',
  strength = 0.32,
}: {
  children: ReactNode;
  className?: string;
  /** Fraction of the pointer's offset the element travels. */
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const cur = useRef({ x: 0, y: 0 });
  const goal = useRef({ x: 0, y: 0 });
  const enabled = useRef(true);

  useEffect(() => {
    enabled.current =
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const tick = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const c = cur.current;
    const g = goal.current;
    c.x += (g.x - c.x) * 0.16;
    c.y += (g.y - c.y) * 0.16;
    el.style.transform = `translate3d(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px, 0)`;

    const settled = Math.abs(c.x - g.x) < 0.1 && Math.abs(c.y - g.y) < 0.1;
    raf.current = settled ? 0 : requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    if (!raf.current) raf.current = requestAnimationFrame(tick);
  }, [tick]);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled.current || e.pointerType !== 'mouse') return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    goal.current.x = (e.clientX - (r.left + r.width / 2)) * strength;
    goal.current.y = (e.clientY - (r.top + r.height / 2)) * strength;
    start();
  };

  const onLeave = () => {
    goal.current.x = 0;
    goal.current.y = 0;
    start();
  };

  return (
    <div
      ref={ref}
      className={`inline-block will-change-transform ${className}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </div>
  );
}
