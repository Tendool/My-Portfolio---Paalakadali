'use client';

/**
 * The mark: an orbital "S".
 *
 * Two counter-curved arcs form the letter, and a third ellipse cuts across
 * them as an orbital path with a body riding it. Drawn in one 40×40 viewBox so
 * it stays crisp from favicon size up to the nav, and built from strokes only
 * so it inverts cleanly on either ground.
 */
export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden focusable="false">
      {/* Badge */}
      <rect x="0" y="0" width="40" height="40" rx="11" className="fill-paper" />

      {/* The S, drawn as two arcs so the join stays optically even. */}
      <path
        d="M26.4 13.2c-1.5-1.9-4-3-6.6-2.8-3.3.2-5.9 2.3-5.8 4.9.1 2.5 2.4 3.7 5.9 4.5 3.5.8 5.8 2 5.9 4.5.1 2.6-2.5 4.7-5.8 4.9-2.6.2-5.1-.9-6.6-2.8"
        fill="none"
        className="stroke-ink"
        strokeWidth="3.4"
        strokeLinecap="round"
      />

      {/* Orbital path across the monogram, with its body at the ascending node. */}
      <ellipse
        cx="20"
        cy="20"
        rx="15.5"
        ry="6"
        fill="none"
        className="stroke-accent"
        strokeWidth="2.2"
        transform="rotate(-28 20 20)"
        opacity="0.95"
      />
      <circle cx="32.4" cy="13.4" r="3.1" className="fill-accent" />
    </svg>
  );
}

/** Mark plus wordmark, as used in the header. */
export default function Logo() {
  return (
    <a
      href="#hero"
      className="group flex shrink-0 items-center gap-2.5"
      aria-label="Sala Tendool Srivatsav — home"
    >
      <LogoMark className="h-9 w-9 transition-transform duration-500 group-hover:rotate-[8deg]" />
      <span className="font-display hidden text-[.95rem] font-bold leading-none tracking-[-.035em] text-paper sm:block">
        Tendool<span className="text-accent">.</span>
      </span>
    </a>
  );
}
