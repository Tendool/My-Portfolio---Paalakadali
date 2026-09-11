'use client';

import { Fragment, type ReactNode } from 'react';

type Tone = 'accent' | 'quiet';

/**
 * An endless scrolling strip.
 *
 * The track holds the items twice and the CSS animation translates it exactly
 * -50%, so the second copy lands where the first began and the loop is
 * seamless with no JS measuring anything.
 *
 * Two tones:
 *  - `accent` — a solid band, set large, used once as a statement.
 *  - `quiet`  — hairline rules, mid-size type and a pinned label. Reads as a
 *               considered index rather than a banner, which is what a list of
 *               domains should be.
 */
export default function Marquee({
  items,
  speed = 28,
  reverse = false,
  className = '',
  tone = 'accent',
  depth = false,
  label,
}: {
  items: string[];
  /** Seconds for one full pass. Bigger is slower. */
  speed?: number;
  reverse?: boolean;
  className?: string;
  tone?: Tone;
  /** Turn the strip in 3D so items travel toward the viewer as they pass. */
  depth?: boolean;
  /** Pinned, non-scrolling caption on the left. */
  label?: string;
}) {
  const quiet = tone === 'quiet';

  const trackClass = quiet
    ? 'font-display text-paper/75 font-medium tracking-[-.02em]'
    : 'kinetic text-ink';

  const renderItems = (hidden: boolean) => (
    <div aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <Fragment key={i}>
          <span className={quiet ? 'px-7' : 'px-6'}>{item}</span>
          {quiet ? (
            // A hairline divider is quieter than a glyph and keeps the rhythm
            // even when item lengths vary a lot.
            <span className="h-4 w-px shrink-0 bg-white/15" />
          ) : (
            <span className="text-accent/70">✦</span>
          )}
        </Fragment>
      ))}
    </div>
  );

  const strip = (
    <div
      className={`marquee ${reverse ? 'marquee-reverse' : ''} ${trackClass}`}
      style={{ '--marquee-duration': `${speed}s` } as React.CSSProperties}
    >
      {renderItems(false)}
      {renderItems(true)}
    </div>
  );

  return (
    <div
      className={`relative ${quiet ? 'border-y border-white/10' : ''} ${
        tone === 'accent' ? 'bg-accent' : ''
      }`}
    >
      <div
        className={`marquee-mask overflow-hidden ${depth ? 'marquee-3d' : ''} ${className}`}
        // The full list is announced once; the duplicate track is decoration.
        role="presentation"
      >
        {depth ? <div className="marquee-tilt">{strip}</div> : strip}
      </div>

      {label && (
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden items-center pl-5 pr-16 sm:flex sm:pl-8">
          {/* The scrim lets the strip run under the label instead of stopping
              short of it, so the loop stays continuous. */}
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-[130%]"
            style={{
              background:
                'linear-gradient(to right, var(--ink) 0%, var(--ink) 55%, transparent 100%)',
            }}
          />
          <span className="label relative !text-[.62rem] !text-paper/55">{label}</span>
        </div>
      )}
    </div>
  );
}
