'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { GALLERY, GAL_FILTERS } from '@/lib/data';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

const DIR = '/assets/projects/';

/** A frame with no file yet still looks deliberate, and says what to drop in. */
function NoSignal({ file }: { file: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="flex flex-col items-center gap-3 px-6 text-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.3" opacity=".55">
          <path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12z" />
          <path d="M3 3l18 18" />
        </svg>
        <p className="font-mono text-[.68rem] uppercase tracking-[.22em] text-accent/70">No signal</p>
        <p className="label !text-[.6rem] !tracking-[.06em]">
          {DIR}
          {file}
        </p>
      </div>
    </div>
  );
}

export default function Album() {
  const [filter, setFilter] = useState('all');
  const [pos, setPos] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  // null = still probing. Resolving up front means the viewer never flashes a
  // broken-image icon.
  const [found, setFound] = useState<Record<string, boolean | null>>(() =>
    Object.fromEntries(GALLERY.map((g) => [g.f, null])),
  );

  useEffect(() => {
    let cancelled = false;
    GALLERY.forEach((g) => {
      const img = new window.Image();
      img.onload = () => !cancelled && setFound((f) => ({ ...f, [g.f]: true }));
      img.onerror = () => !cancelled && setFound((f) => ({ ...f, [g.f]: false }));
      img.src = DIR + g.f;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const shown = useMemo(
    () => GALLERY.filter((g) => filter === 'all' || g.cat === filter),
    [filter],
  );

  const current = shown[Math.min(pos, shown.length - 1)];
  const step = useCallback(
    (dir: number) => setPos((p) => (shown.length ? (p + dir + shown.length) % shown.length : 0)),
    [shown.length],
  );

  useEffect(() => setPos(0), [filter]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [step]);

  useEffect(() => {
    document.body.style.overflow = lightbox ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightbox]);

  if (!current) return null;

  return (
    <section id="gallery" className="relative z-10 px-5 py-28 sm:px-8 sm:py-36">
      <div className="mx-auto max-w-[1320px]">
        <SectionHeading
          index="04"
          label="Field imagery"
          title="The"
          accent="Album"
          blurb="Builds, rigs and screens from the field. Pick a feed from the rail, or step through with ← / →."
        />

        <Reveal className="mb-8 flex flex-wrap gap-2">
          {GAL_FILTERS.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              aria-pressed={filter === key}
              className={`sticker transition-colors ${
                filter === key ? 'sticker-solid' : 'hover:border-accent/50 hover:text-paper'
              }`}
            >
              {label}
            </button>
          ))}
        </Reveal>

        <Reveal>
          <div className="glass overflow-hidden p-3">
            <div className="viewer">
              {found[current.f] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={DIR + current.f} alt={current.cap} className="viewer-img" />
              ) : (
                <NoSignal file={current.f} />
              )}

              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, rgba(5,6,10,.92) 0%, transparent 34%),' +
                    'linear-gradient(to bottom, rgba(5,6,10,.75) 0%, transparent 24%)',
                }}
              />

              <div className="absolute inset-x-0 top-0 flex items-center gap-3 p-4">
                <span className="sticker sticker-accent">{current.tag}</span>
                <span className="label ml-auto !text-[.62rem]">
                  {String(pos + 1).padStart(2, '0')} / {String(shown.length).padStart(2, '0')}
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 sm:p-5">
                <p className="max-w-lg text-[.88rem] leading-relaxed text-paper/85">{current.cap}</p>
                {found[current.f] && (
                  <button
                    onClick={() => setLightbox(true)}
                    className="btn btn-ghost shrink-0 !px-4 !py-2.5 !text-[.62rem]"
                  >
                    Expand
                  </button>
                )}
              </div>

              <button
                onClick={() => step(-1)}
                aria-label="Previous feed"
                className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-ink/70 text-paper/80 backdrop-blur-md transition-colors hover:border-accent hover:text-accent"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M15 6l-6 6 6 6" />
                </svg>
              </button>
              <button
                onClick={() => step(1)}
                aria-label="Next feed"
                className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-ink/70 text-paper/80 backdrop-blur-md transition-colors hover:border-accent hover:text-accent"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-4">
          <div className="rail flex gap-2 overflow-x-auto pb-2">
            {shown.map((g, i) => (
              <button
                key={g.f}
                onClick={() => setPos(i)}
                className={`thumb ${i === pos ? 'on' : ''}`}
                aria-label={g.tag}
                aria-current={i === pos}
                style={found[g.f] ? { backgroundImage: `url(${DIR}${g.f})` } : undefined}
              >
                {!found[g.f] && (
                  <span className="font-mono absolute inset-0 grid place-items-center text-[.45rem] uppercase tracking-[.1em] text-paper/25">
                    No sig
                  </span>
                )}
              </button>
            ))}
          </div>
        </Reveal>

      </div>

      {lightbox && found[current.f] && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-10"
          role="dialog"
          aria-modal="true"
          aria-label={current.cap}
        >
          <button
            className="absolute inset-0 bg-ink/93 backdrop-blur-md"
            onClick={() => setLightbox(false)}
            aria-label="Close"
            tabIndex={-1}
          />
          <button
            onClick={() => setLightbox(false)}
            className="absolute right-5 top-5 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/20 text-paper/70 transition-colors hover:border-accent hover:text-accent"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <div className="relative max-h-full w-full max-w-5xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={DIR + current.f}
              alt={current.cap}
              className="mx-auto max-h-[76vh] w-auto rounded-[var(--radius-card)] border border-white/12"
            />
            <div className="mt-6 text-center">
              <span className="sticker sticker-accent mb-3">{current.tag}</span>
              <p className="text-[.95rem] text-paper/85">{current.cap}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
