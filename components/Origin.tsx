'use client';

import { EDU } from '@/lib/data';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

export default function Origin() {
  return (
    <section id="origin" className="relative z-10 px-5 py-28 sm:px-8 sm:py-36">
      <div className="mx-auto max-w-[1000px]">
        <SectionHeading index="06" label="Origin story" title="Education" />

        {/* Ruled rows, not identical cards. Education is a chronology, so it
            reads better as a list with the year doing the anchoring. */}
        <ul className="border-t border-white/12">
          {EDU.map((e, i) => (
            <Reveal as="li" key={e.s} delay={i * 0.07}>
              <div className="group grid grid-cols-1 gap-4 border-b border-white/12 py-9 transition-colors duration-300 hover:bg-white/[.025] sm:grid-cols-[8rem_1fr_auto] sm:items-baseline sm:gap-8 sm:px-4">
                <div className="flex items-center gap-3">
                  <span className="font-display text-[2rem] font-bold leading-none tracking-[-.045em] text-paper transition-colors duration-300 group-hover:text-accent">
                    {e.y}
                  </span>
                  {e.live && (
                    <span className="relative flex h-2 w-2" title="In progress">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-display text-[1.1rem] font-semibold tracking-[-.02em] text-paper">
                    {e.s}
                  </h3>
                  <p className="mt-1.5 text-[.9rem] leading-relaxed text-paper/50">{e.d}</p>
                </div>

                <span className="sticker justify-self-start sm:justify-self-end">{e.m}</span>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
