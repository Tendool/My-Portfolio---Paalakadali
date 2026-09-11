'use client';

import { PROFILE } from '@/lib/data';
import Reveal from './Reveal';
import Magnetic from './Magnetic';

const LINKS = [
  {
    label: 'Email',
    value: PROFILE.email,
    href: `mailto:${PROFILE.email}`,
    wide: true,
  },
  {
    label: 'GitHub',
    value: '@Tendool',
    href: PROFILE.github,
    external: true,
  },
  {
    label: 'LinkedIn',
    value: 'sala-tendool-srivatsav',
    href: PROFILE.linkedin,
    external: true,
  },
];

export default function Contact() {
  return (
    <section id="contact" className="relative z-10 px-5 py-28 sm:px-8 sm:py-36">
      <div className="mx-auto max-w-[1100px]">
        <Reveal className="mb-6 flex items-center gap-4" y={16}>
          <span className="sticker sticker-accent sticker-tilt-l">07</span>
          <span className="label">Rendezvous</span>
          <span className="rule hidden flex-1 sm:block" />
        </Reveal>

        {/* The one place the accent takes over the whole block. */}
        <Reveal as="h2" className="kinetic mb-10 text-[clamp(2.8rem,10vw,8rem)]" y={40}>
          Let&apos;s build
          <br />
          <span className="text-accent accent-glow">something</span>
        </Reveal>

        <Reveal className="mb-14 max-w-xl text-[1.05rem] leading-[1.75] text-paper/55">
          Open to AI/ML engineering roles and research collaborations. The fastest way to reach me
          is email — I read everything.
        </Reveal>

        <Reveal className="mb-14 flex flex-wrap items-center gap-3">
          <Magnetic>
            <a
              href={`mailto:${PROFILE.email}?subject=${encodeURIComponent(
                `Opportunity for ${PROFILE.full}`,
              )}`}
              className="btn btn-accent !px-8 !py-5 !text-[.8rem]"
            >
              Send a message
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
              </svg>
            </a>
          </Magnetic>
          {PROFILE.phones.map((p, i) => (
            <Magnetic key={p}>
              <a href={`tel:${PROFILE.tels[i]}`} className="btn btn-ghost">
                {p}
              </a>
            </Magnetic>
          ))}
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LINKS.map((l, i) => (
            <Reveal
              key={l.label}
              className={`h-full ${l.wide ? 'lg:col-span-2' : ''}`}
              delay={i * 0.07}
            >
              <a
                href={l.href}
                {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="glass glass-hover group flex h-full flex-col justify-between gap-6 p-7"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="label !text-[.6rem]">{l.label}</span>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    className="shrink-0 text-paper/30 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                  >
                    <path d="M7 17L17 7M8 7h9v9" />
                  </svg>
                </div>
                <span className="font-display break-all text-[1rem] font-semibold tracking-[-.02em] text-paper transition-colors duration-300 group-hover:text-accent">
                  {l.value}
                </span>
              </a>
            </Reveal>
          ))}

          <Reveal className="h-full" delay={0.21}>
            <div className="glass flex h-full flex-col justify-between gap-6 p-7">
              <span className="label !text-[.6rem]">Based in</span>
              <span className="font-display text-[1rem] font-semibold leading-snug tracking-[-.02em] text-paper">
                {PROFILE.location[0]}
                <br />
                <span className="text-paper/50">{PROFILE.location[1]}</span>
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
