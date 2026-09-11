'use client';

import type { ReactNode } from 'react';
import Reveal from './Reveal';

/**
 * The section opener: a stamped index, a mono label, then the headline at full
 * volume. The accent word is the only place accent appears in a heading, which is
 * what keeps it feeling like an accent rather than a second body colour.
 */
export default function SectionHeading({
  index,
  label,
  title,
  accent,
  blurb,
  align = 'left',
  className = '',
}: {
  /** Two-digit section number. */
  index: string;
  label: string;
  title: string;
  accent?: string;
  blurb?: ReactNode;
  align?: 'left' | 'center';
  /** Lets a cramped section tighten the block without forking the component. */
  className?: string;
}) {
  const centered = align === 'center';

  return (
    <div className={`mb-14 sm:mb-20 ${centered ? 'text-center' : ''} ${className}`}>
      <Reveal
        className={`mb-6 flex items-center gap-4 ${centered ? 'justify-center' : ''}`}
        y={16}
      >
        <span className="sticker sticker-accent sticker-tilt-l">{index}</span>
        <span className="label">{label}</span>
        {!centered && <span className="rule hidden flex-1 sm:block" />}
      </Reveal>

      <Reveal as="h2" className="kinetic text-[clamp(2.6rem,8.5vw,7rem)]" y={40}>
        {title}
        {accent && (
          <>
            {' '}
            <span className="text-accent accent-glow">{accent}</span>
          </>
        )}
      </Reveal>

      {blurb && (
        <Reveal
          className={`mt-7 text-[1rem] leading-[1.75] text-paper/55 sm:text-[1.08rem] ${
            centered ? 'mx-auto max-w-xl' : 'max-w-2xl'
          }`}
        >
          {blurb}
        </Reveal>
      )}
    </div>
  );
}
