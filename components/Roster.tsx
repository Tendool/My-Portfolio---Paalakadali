'use client';

import { ROSTER } from '@/lib/data';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

/**
 * Column spans for the bento. Three wide cells among six, arranged so every
 * row fills exactly: (2+1), (1+2), (1+2) across a three-column grid.
 */
const SPANS = ['lg:col-span-2', '', '', 'lg:col-span-2', '', 'lg:col-span-2'];

export default function Roster() {
  return (
    <section id="roster" className="relative z-10 px-5 py-28 sm:px-8 sm:py-36">
      <div className="mx-auto max-w-[1320px]">
        <SectionHeading
          index="01"
          label="Specializations"
          title="The"
          accent="Roster"
          blurb="Six operational domains — each backed by shipped, resume-verified work."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ROSTER.map((r, i) => {
            const wide = SPANS[i] !== '';
            return (
              <Reveal key={r.code} className={`h-full ${SPANS[i]}`} delay={(i % 3) * 0.07}>
                <article className="glass glass-hover group flex h-full flex-col p-7 sm:p-8">
                  <div className="mb-7 flex items-start justify-between gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/12 bg-white/[.04] transition-colors duration-300 group-hover:border-accent/50 group-hover:bg-accent/10">
                      <svg
                        width="23"
                        height="23"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-paper/80 transition-colors duration-300 group-hover:text-accent"
                        dangerouslySetInnerHTML={{ __html: r.glyph }}
                      />
                    </div>
                    <span className="font-display text-[2.4rem] font-bold leading-none tracking-[-.05em] text-paper/[.07] transition-colors duration-500 group-hover:text-accent/20">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <h3 className="font-display mb-1.5 text-[1.3rem] font-semibold tracking-[-.03em] text-paper">
                    {r.code}
                  </h3>
                  <p className="label mb-6 !normal-case !tracking-[.02em] !text-[.76rem]">
                    {r.spec}
                  </p>

                  <p
                    className={`mb-7 leading-[1.75] text-paper/60 ${
                      wide ? 'max-w-xl text-[.96rem]' : 'text-[.9rem]'
                    }`}
                  >
                    {r.impact}
                  </p>

                  <div className="mt-auto">
                    <div className="mb-6 flex flex-wrap gap-1.5">
                      {r.tags.map((t) => (
                        <span key={t} className="sticker">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="border-t border-white/10 pt-4">
                      <p className="label mb-1.5 !text-[.58rem] !text-accent/70">Flagship</p>
                      <p className="text-[.86rem] leading-snug text-paper/85">{r.flag}</p>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
