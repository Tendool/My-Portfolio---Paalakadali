'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PROJECTS, FILTERS, type Project } from '@/lib/data';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

gsap.registerPlugin(ScrollTrigger);

/* -------------------------------------------------------------------- sheet */

function FileSheet({
  project,
  index,
  onClose,
}: {
  project: Project;
  index: number;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={project.n}
    >
      <button
        className="absolute inset-0 bg-ink/85 backdrop-blur-md"
        onClick={onClose}
        aria-label="Close file"
        tabIndex={-1}
      />

      <div className="glass relative max-h-[86vh] w-full max-w-2xl overflow-y-auto p-7 sm:p-10">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full border border-white/15 text-paper/60 transition-colors hover:border-accent hover:text-accent"
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <span className="sticker sticker-accent mb-5">File {String(index + 1).padStart(2, '0')}</span>

        <h3 className="font-display mb-4 pr-12 text-[1.6rem] font-semibold leading-[1.1] tracking-[-.03em] text-paper sm:text-[2rem]">
          {project.n}
        </h3>

        <div className="mb-7 flex flex-wrap items-center gap-3">
          <span className={`sticker ${project.o === 'Yitro Global' ? 'sticker-accent' : ''}`}>
            {project.o}
          </span>
          <span className="label">{project.t}</span>
        </div>

        {project.conf && (
          <p className="label mb-7 rounded-2xl border border-white/10 bg-white/[.03] px-4 py-3 !normal-case !tracking-normal !text-[.82rem] leading-relaxed">
            Client project — internal name withheld.
          </p>
        )}

        <ul className="mb-8 flex flex-col gap-4">
          {project.b.map((line, i) => (
            <li key={i} className="flex gap-3.5 text-[.94rem] leading-[1.75] text-paper/70">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span>{line}</span>
            </li>
          ))}
        </ul>

        <div className="border-t border-white/10 pt-6">
          <p className="label mb-3">Stack</p>
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((t) => (
              <span key={t} className="sticker">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- card */

function FileCard({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: () => void;
}) {
  return (
    <article
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open file: ${project.n}`}
      className="glass glass-hover group flex w-[78vw] shrink-0 cursor-pointer flex-col p-6 sm:w-[360px] sm:p-7"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="font-display text-[2.6rem] font-bold leading-none tracking-[-.05em] text-paper/[.09] transition-colors duration-500 group-hover:text-accent/25">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className={`sticker ${project.o === 'Yitro Global' ? 'sticker-accent' : ''}`}>
          {project.o}
        </span>
      </div>

      <h3 className="font-display mb-2.5 text-[1.18rem] font-semibold leading-[1.2] tracking-[-.025em] text-paper">
        {project.n}
      </h3>
      <p className="label mb-4 !text-[.62rem]">{project.t}</p>

      <p className="mb-5 line-clamp-3 text-[.86rem] leading-[1.65] text-paper/55">{project.b[0]}</p>

      <div className="mt-auto">
        <div className="mb-5 flex flex-wrap gap-1.5">
          {project.tags.slice(0, 3).map((t) => (
            <span key={t} className="sticker">
              {t}
            </span>
          ))}
        </div>
        <span className="font-mono inline-flex items-center gap-2 text-[.64rem] uppercase tracking-[.12em] text-accent">
          Open file
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */

export default function MissionFiles() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [pinned, setPinned] = useState(false);
  const [filter, setFilter] = useState('all');

  const visible = useMemo(
    () =>
      PROJECTS.map((p, i) => ({ p, i })).filter(
        ({ p }) => filter === 'all' || p.c.includes(filter),
      ),
    [filter],
  );

  useEffect(() => {
    const track = trackRef.current;
    const section = sectionRef.current;
    if (!track || !section) return;

    // Pinned horizontal scrolling is a desktop-only treatment. On a phone it
    // fights the browser's own gesture handling and the URL-bar collapse, so
    // there the rail is just a native swipeable overflow.
    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      setPinned(true);

      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 80);

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          // The section is held for exactly as long as the track needs to
          // travel, so the hand-off back to vertical scrolling is seamless.
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        setPinned(false);
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(track, { x: 0 });
      };
    });

    return () => mm.revert();
  }, []);

  useEffect(() => {
    // The rail's width just changed; recompute every pinned distance. Two
    // frames of delay lets React commit the new cards first.
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => ScrollTrigger.refresh()),
    );
    return () => cancelAnimationFrame(id);
  }, [filter]);

  return (
    <>
      <section
        ref={sectionRef}
        id="files"
        className="relative z-10 overflow-hidden py-28 sm:py-36 lg:flex lg:min-h-svh lg:flex-col lg:justify-center lg:py-0"
      >
        <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8">
          <SectionHeading
            index="03"
            label="Project archive"
            title="Mission"
            accent="Files"
            blurb="Every shipped project, end to end. Scroll or swipe the rail — open any file for the full detail."
            // Pinned, this whole section must fit one viewport, so the heading
            // gives back the space the cards need.
            className="lg:mb-6 lg:[&_h2]:text-[clamp(2.4rem,5.4vw,4.6rem)] lg:[&_p]:mt-4"
          />

          <div className="mb-6 flex flex-wrap gap-2 lg:mb-5">
            {FILTERS.map(([key, label]) => (
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
          </div>
        </div>

        <div
          className={`rail ${pinned ? 'overflow-hidden' : 'overflow-x-auto'} pb-4`}
          // The whole strip is a horizontally scrollable region when not pinned.
          tabIndex={pinned ? -1 : 0}
          aria-label="Project files"
        >
          <div
            ref={trackRef}
            className="flex w-max items-stretch gap-4 px-5 sm:px-8"
            style={{ willChange: 'transform' }}
          >
            {visible.map(({ p, i }) => (
              <FileCard key={p.n} project={p} index={i} onOpen={() => setOpenIndex(i)} />
            ))}

            {/* End cap: a deliberate stop, so the rail does not just run out. */}
            <div className="glass flex w-[78vw] shrink-0 flex-col items-start justify-center gap-5 p-8 sm:w-[300px]">
              <p className="kinetic text-[2rem] leading-[0.95] text-paper">
                That&apos;s the
                <br />
                <span className="text-accent">archive.</span>
              </p>
              <p className="text-[.9rem] leading-relaxed text-paper/55">
                {visible.length} of {PROJECTS.length} files shown
                {filter === 'all' ? ' — six domains.' : ' in this domain.'}
              </p>
              <a href="#contact" className="btn btn-accent !px-6 !py-3 !text-[.68rem]">
                Work together
              </a>
            </div>
          </div>
        </div>
      </section>

      {openIndex !== null && (
        <FileSheet
          project={PROJECTS[openIndex]}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}
