import { ARSENAL, TIERS, type SkillTier } from '@/lib/data';

function Meter({ tier }: { tier: SkillTier }) {
  const { level, label } = TIERS[tier];
  return (
    <span className="meter shrink-0 text-ink" title={label} aria-label={label} role="img">
      {[1, 2, 3].map((n) => (
        <i key={n} data-on={n <= level} />
      ))}
    </span>
  );
}

export default function Toolkit() {
  return (
    <section id="toolkit" className="pt-28 lg:pt-44">
      <div className="wrap grid gap-10 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-4">
          <div className="rv lg:sticky lg:top-28">
            <h2 className="serif text-[clamp(2.4rem,4.6vw,4.2rem)] leading-none tracking-[-0.02em]">Toolkit</h2>
            <ul className="meta mt-8 flex flex-col gap-2.5">
              {(Object.keys(TIERS) as SkillTier[]).map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <Meter tier={t} />
                  {TIERS[t].label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:col-span-8 xl:grid-cols-3">
          {ARSENAL.map((group, gi) => (
            <div key={group.g} className="rv" style={{ ['--d' as string]: `${(gi % 3) * 0.06}s` }}>
              <h3 className="serif border-b border-ink pb-3 text-[1.35rem] leading-tight">{group.g}</h3>
              <ul>
                {group.i.map(([name, tier]) => (
                  <li
                    key={name}
                    className="flex items-center justify-between gap-4 border-b border-rule py-2.5 text-[.95rem]"
                  >
                    <span className={tier === 'work' ? 'text-soft' : ''}>{name}</span>
                    <Meter tier={tier} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
