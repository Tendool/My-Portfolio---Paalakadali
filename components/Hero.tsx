'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PROFILE } from '@/lib/data';
import Reveal from './Reveal';
import Magnetic from './Magnetic';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [imgOk, setImgOk] = useState(true);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      // Each line of the name arrives on its own, from below a mask — the
      // overflow-hidden wrapper is what turns a fade into a reveal.
      gsap.from('[data-hero-line]', {
        yPercent: 115,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.09,
        delay: 0.15,
      });

      // Copy and portrait leave at different rates, echoing the depth the
      // galaxy behind them is already selling.
      gsap.to(copyRef.current, {
        y: -80,
        opacity: 0.15,
        ease: 'none',
        scrollTrigger: { trigger: rootRef.current, start: 'top top', end: 'bottom top', scrub: 0.8 },
      });
      gsap.to(cardRef.current, {
        y: -150,
        ease: 'none',
        scrollTrigger: { trigger: rootRef.current, start: 'top top', end: 'bottom top', scrub: 1.2 },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="hero"
      className="relative z-10 flex min-h-svh items-center px-5 pb-24 pt-28 sm:px-8"
    >
      {/* Scrim under the copy. The galaxy is brightest dead centre, exactly
          where the paragraph sits — this keeps text crisp while leaving the
          disc fully visible to its right. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          background:
            'linear-gradient(to right, rgba(5,6,10,.96) 0%, rgba(5,6,10,.86) 26%, rgba(5,6,10,.4) 44%, transparent 64%)',
        }}
      />

      <div className="relative mx-auto grid w-full max-w-[1320px] items-center gap-14 lg:grid-cols-[1.2fr_.8fr] lg:gap-20">
        <div ref={copyRef} className="order-1">
          <Reveal className="mb-7 flex flex-wrap items-center gap-x-5 gap-y-2.5" y={16}>
            <span className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span className="font-mono text-[.72rem] tracking-[.08em] text-paper">
                Available for AI/ML roles from 2027
              </span>
            </span>
            <span className="hidden h-3 w-px bg-white/15 sm:block" />
            <span className="font-mono text-[.72rem] tracking-[.08em] text-paper/50">
              Bobbili, Andhra Pradesh, India
            </span>
          </Reveal>

          <h1 className="kinetic mb-7 text-[clamp(2.6rem,8.4vw,6.6rem)]">
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-hero-line className="block text-paper/45">
                {PROFILE.first} {PROFILE.middle}
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-hero-line className="block text-paper">
                {PROFILE.last}
              </span>
            </span>
          </h1>

          <Reveal className="mb-7 max-w-lg border-l-2 border-accent pl-5">
            <p className="text-[1.05rem] leading-snug text-paper sm:text-[1.2rem]">
              AI/ML Engineer building{' '}
              <span className="text-accent">agentic systems</span> &amp; applied deep learning.
            </p>
          </Reveal>

          <Reveal className="mb-9 max-w-xl text-[.94rem] leading-[1.75] text-paper/55">
            I build agentic AI, LLM, and deep learning systems across{' '}
            <span className="text-paper">healthcare, agriculture, robotics, and enterprise</span> —
            from data pipeline through to deployment. Currently an AI intern at{' '}
            <span className="text-paper">Yitro Global</span>, alongside a B.Tech in AI &amp; Data
            Science.
          </Reveal>

          <Reveal className="mb-10 flex flex-wrap items-center gap-3">
            <Magnetic>
              <a href="#files" className="btn btn-accent">
                See the work
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </Magnetic>
            <Magnetic>
              <a href="#contact" className="btn btn-ghost">
                Get in touch
              </a>
            </Magnetic>
          </Reveal>

          <Reveal className="flex max-w-md gap-10 border-t border-white/10 pt-6 sm:gap-14">
            {PROFILE.stats.map((s) => (
              <div key={s.l}>
                <div className="font-display text-[2.2rem] font-bold leading-none tracking-[-.04em] text-accent sm:text-[2.6rem]">
                  {s.v}
                </div>
                <div className="label mt-1.5 !text-[.6rem]">{s.l}</div>
              </div>
            ))}
          </Reveal>
        </div>

        {/* ---------------------------- PORTRAIT --------------------------- */}
        <div ref={cardRef} className="order-2 flex justify-center lg:justify-end">
          <Reveal className="relative w-full max-w-[265px]" y={44}>
            <div className="glass overflow-hidden">
              <div className="relative aspect-[4/5] overflow-hidden">
                {imgOk ? (
                  <Image
                    src="/assets/profile.png"
                    alt={PROFILE.full}
                    fill
                    priority
                    sizes="(max-width: 1024px) 62vw, 265px"
                    // Framed on the face rather than the top edge of the file,
                    // so the crop reads as a portrait instead of a screenshot.
                    className="object-cover"
                    style={{ objectPosition: '50% 22%' }}
                    onError={() => setImgOk(false)}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2">
                    <span className="font-display text-5xl font-bold text-accent">STS</span>
                    <span className="label">assets/profile.png</span>
                  </div>
                )}

                {/* A light vignette only — no scrim, since nothing sits on top. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(ellipse 90% 70% at 50% 38%, transparent 45%, rgba(5,6,10,.55) 100%)',
                  }}
                />

                <span className="font-mono absolute right-3 top-3 rounded-full border border-accent/45 bg-ink/70 px-2.5 py-1 text-[.56rem] uppercase tracking-[.1em] text-accent backdrop-blur-md">
                  AI / ML
                </span>
              </div>

              <div className="border-t border-white/10 px-5 py-4">
                <p className="font-display text-[.95rem] font-semibold leading-tight tracking-[-.02em] text-paper">
                  {PROFILE.full}
                </p>
                <p className="font-mono mt-1.5 text-[.64rem] tracking-[.06em] text-paper/45">
                  AI Intern · Yitro Global
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-8 flex justify-center px-5">
        <span className="label flex items-center gap-2.5 !text-[.6rem]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M8 7L5 10l3 3M16 7l3 3-3 3" />
          </svg>
          Drag to spin the galaxy · scroll to launch
        </span>
      </div>
    </section>
  );
}
