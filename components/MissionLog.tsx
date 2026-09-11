'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TIMELINE, ROLE } from '@/lib/data';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

gsap.registerPlugin(ScrollTrigger);

type Point = { x: number; y: number };

/**
 * The timeline as a constellation: cards zigzag down the column and a glowing
 * line is drawn between their anchor stars as you scroll, lighting each one as
 * it arrives.
 */
export default function MissionLog() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pathRef = useRef<SVGPolylineElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [open, setOpen] = useState<number | null>(0);

  /** Re-measure where every star sits, in container-local pixels. */
  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const wr = wrap.getBoundingClientRect();
    const next: Point[] = [];
    nodeRefs.current.forEach((n) => {
      if (!n) return;
      const r = n.getBoundingClientRect();
      next.push({ x: r.left - wr.left + r.width / 2, y: r.top - wr.top + r.height / 2 });
    });
    setBox({ w: wr.width, h: wr.height });
    setPoints(next);
  }, []);

  useLayoutEffect(() => {
    measure();
    const wrap = wrapRef.current;
    if (!wrap) return;
    // Cards change height when they expand, moving every star below them.
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [measure, open]);

  useEffect(() => {
    const path = pathRef.current;
    const wrap = wrapRef.current;
    if (!path || !wrap || points.length < 2) return;

    const stars = wrap.querySelectorAll<SVGGElement>('[data-star]');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      path.style.strokeDashoffset = '0';
      stars.forEach((s) => s.setAttribute('data-lit', 'true'));
      return;
    }

    // pathLength=1 normalises the dash maths, so the draw works regardless of
    // how long the polyline actually is at this breakpoint.
    path.style.strokeDasharray = '1';
    path.style.strokeDashoffset = '1';

    const proxy = { p: 0 };
    const tween = gsap.to(proxy, {
      p: 1,
      ease: 'none',
      scrollTrigger: { trigger: wrap, start: 'top 78%', end: 'bottom 62%', scrub: 0.7 },
      onUpdate: () => {
        path.style.strokeDashoffset = String(1 - proxy.p);
        stars.forEach((s, i) => {
          const at = points.length > 1 ? i / (points.length - 1) : 0;
          s.setAttribute('data-lit', proxy.p >= at - 0.02 ? 'true' : 'false');
        });
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [points]);

  return (
    <section id="missions" className="relative z-10 px-5 py-28 sm:px-8 sm:py-36">
      <div className="mx-auto max-w-5xl">
        <SectionHeading index="02" label="Experience" title="Mission" accent="Log" />

        {/* Current posting */}
        <Reveal className="mb-16">
          <div className="glass glass-hover flex flex-wrap items-start justify-between gap-5 p-7 sm:p-9">
            <div>
              <h3 className="font-display mb-2 text-[1.7rem] font-semibold tracking-[-.03em] text-paper sm:text-[2.1rem]">
                {ROLE.org}
              </h3>
              <p className="text-[.95rem] leading-relaxed text-accent">{ROLE.title}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="sticker sticker-solid sticker-tilt-r">{ROLE.span}</span>
              <span className="sticker">{ROLE.mode}</span>
            </div>
          </div>
        </Reveal>

        <Reveal className="mb-14 flex flex-wrap items-center gap-3">
          <span className="label">Also on the log</span>
          <span className="sticker sticker-tilt-l">★ {ROLE.event.detail}</span>
        </Reveal>

        {/* ------------------------- CONSTELLATION ------------------------- */}
        <div ref={wrapRef} className="relative">
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            viewBox={`0 0 ${box.w || 1} ${box.h || 1}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="constellationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="1" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.45" />
              </linearGradient>
              <filter id="constellationGlow" x="-70%" y="-70%" width="240%" height="240%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {points.length > 1 && (
              <>
                {/* Unlit track, so the route reads before you scroll it. */}
                <polyline
                  className="constellation-track"
                  points={points.map((p) => `${p.x},${p.y}`).join(' ')}
                />
                <polyline
                  ref={pathRef}
                  className="constellation-line"
                  pathLength={1}
                  points={points.map((p) => `${p.x},${p.y}`).join(' ')}
                />
              </>
            )}

            {points.map((p, i) => (
              <g key={i} data-star data-lit="false" className="star-node">
                <circle cx={p.x} cy={p.y} r="16" fill="#8b5cf6" opacity="0.07" />
                <circle cx={p.x} cy={p.y} r="7" fill="none" stroke="#8b5cf6" strokeWidth="1.1" opacity="0.5" />
                <circle cx={p.x} cy={p.y} r="3.4" fill="#8b5cf6" filter="url(#constellationGlow)" />
              </g>
            ))}
          </svg>

          <ol className="relative flex flex-col gap-5">
            {TIMELINE.map((x, i) => {
              const right = i % 2 === 1;
              const isOpen = open === i;
              return (
                <li
                  key={x.t}
                  className={`relative flex w-full items-center gap-6 lg:w-[56%] ${
                    right ? 'lg:ml-auto lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* The star this card hangs from. */}
                  <div
                    ref={(el) => {
                      nodeRefs.current[i] = el;
                    }}
                    className="h-4 w-4 shrink-0"
                  />

                  <Reveal className="min-w-0 flex-1">
                    <div className="glass overflow-hidden">
                      <button
                        onClick={() => setOpen(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between gap-4 p-6 text-left"
                      >
                        <span className="font-display text-[1.02rem] font-semibold tracking-[-.02em] text-paper">
                          {x.t}
                        </span>
                        <span
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                            isOpen
                              ? 'rotate-45 border-accent bg-accent text-ink'
                              : 'border-white/20 text-paper/60'
                          }`}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                        </span>
                      </button>
                      <div
                        className="grid transition-all duration-500 ease-out"
                        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                      >
                        <div className="overflow-hidden">
                          <p className="px-6 pb-6 text-[.9rem] leading-[1.75] text-paper/60">
                            {x.d}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
