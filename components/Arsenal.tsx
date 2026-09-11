'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { ARSENAL, type SkillTier } from '@/lib/data';
import type { OrbitNode } from './three/SkillSphere';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import LazyCanvas from './LazyCanvas';

const SkillSphere = dynamic(() => import('./three/SkillSphere'), { ssr: false });

const TIER_LABEL: Record<SkillTier, string> = {
  core: 'Core',
  prof: 'Proficient',
  work: 'Working knowledge',
};

const TIER_CLASS: Record<SkillTier, string> = {
  core: 'sticker-solid',
  prof: 'sticker-accent',
  work: '',
};

export default function Arsenal() {
  const [hovered, setHovered] = useState<OrbitNode | null>(null);

  const totals = useMemo(() => {
    const counts: Record<SkillTier, number> = { core: 0, prof: 0, work: 0 };
    ARSENAL.forEach((g) => g.i.forEach(([, tier]) => (counts[tier] += 1)));
    return counts;
  }, []);

  return (
    <section id="arsenal" className="relative z-10 px-5 py-28 sm:px-8 sm:py-36">
      <div className="mx-auto max-w-[1320px]">
        <SectionHeading
          index="05"
          label="Loadout"
          title="The"
          accent="Arsenal"
          blurb="Every tool, on one sphere. Drag to spin it and hover any node to read it out — or scan the full loadout below."
        />

        {/* ------------------- SPHERE + LIVE READOUT ---------------------- */}
        <Reveal className="mb-5">
          <div className="glass grid overflow-hidden lg:grid-cols-[1fr_320px]">
            <LazyCanvas
              className="relative h-[380px] w-full sm:h-[520px]"
              camera={{ fov: 30, position: [0, 0, 18] }}
              placeholder={
                <div className="label absolute inset-0 grid place-items-center">
                  Loading loadout…
                </div>
              }
            >
              <SkillSphere onHover={setHovered} />
            </LazyCanvas>

            {/* The readout is its own column on desktop rather than an overlay,
                so it never covers the nodes it is describing. */}
            <div className="flex flex-col justify-between gap-6 border-t border-white/10 p-6 sm:p-7 lg:border-l lg:border-t-0">
              <div>
                <p className="label mb-4 !text-[.6rem]">Selected</p>
                <div className="min-h-[6.5rem]">
                  {hovered ? (
                    <>
                      <p className="font-display text-[1.5rem] font-semibold leading-[1.1] tracking-[-.03em] text-paper">
                        {hovered.name}
                      </p>
                      <p className="mt-2.5 text-[.86rem] leading-relaxed text-paper/50">
                        {hovered.group}
                      </p>
                      <span className={`sticker mt-4 ${TIER_CLASS[hovered.tier]}`}>
                        {TIER_LABEL[hovered.tier]}
                      </span>
                    </>
                  ) : (
                    <p className="text-[.9rem] leading-relaxed text-paper/40">
                      Hover a node to see where it fits — or drag the sphere to bring the far side
                      round.
                    </p>
                  )}
                </div>
              </div>

              <dl className="grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
                {(Object.keys(totals) as SkillTier[]).map((tier) => (
                  <div key={tier}>
                    <dt className="label !text-[.55rem]">{TIER_LABEL[tier]}</dt>
                    <dd className="font-display mt-1 text-[1.5rem] font-bold leading-none tracking-[-.04em] text-paper">
                      {totals[tier]}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Reveal>

        {/* --------------------------- FULL LOADOUT ------------------------ */}
        <Reveal className="mb-10 flex flex-wrap items-center gap-2">
          <span className="label mr-1">Legend</span>
          <span className="sticker sticker-solid">Core</span>
          <span className="sticker sticker-accent">Proficient</span>
          <span className="sticker">Working knowledge</span>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ARSENAL.map((a, i) => (
            <Reveal key={a.g} className="h-full" delay={(i % 3) * 0.07}>
              <div className="glass glass-hover h-full p-7">
                <div className="mb-6 flex items-baseline justify-between gap-3 border-b border-white/10 pb-4">
                  <h3 className="font-display text-[1.02rem] font-semibold tracking-[-.02em] text-paper">
                    {a.g}
                  </h3>
                  <span className="label !text-[.6rem]">{a.i.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {a.i.map(([name, tier]) => (
                    <span key={name} className={`sticker ${TIER_CLASS[tier]}`}>
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
