import { FEATURED, PROJECTS } from '@/lib/data';
import Figure from './figures/Figure';

export default function SelectedWork() {
  return (
    <section id="work" className="pt-24 lg:pt-36">
      <div className="wrap">
        <div className="rv flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-6">
          <h2 className="serif text-[clamp(2.4rem,4.6vw,4.2rem)] leading-none tracking-[-0.02em]">Selected work</h2>
          <p className="meta">
            {FEATURED.length} of {PROJECTS.length} — the rest are in the{' '}
            <a href="#index" className="link text-ink">
              index
            </a>
          </p>
        </div>

        <div className="grid gap-x-14 gap-y-20 pt-12 md:grid-cols-2 lg:gap-y-28 lg:pt-16">
          {FEATURED.map((f, i) => {
            const project = PROJECTS.find((p) => p.id === f.id);
            return (
              <article
                key={f.id}
                data-figure-card
                className={`rv ${i % 2 === 1 ? 'md:mt-24' : ''}`}
                style={{ ['--d' as string]: `${(i % 2) * 0.08}s` }}
              >
                <Figure kind={f.figure} label={f.label} />

                <div className="mt-9 grid grid-cols-[2.25rem_1fr] gap-x-3">
                  <span className="meta pt-[.55rem] tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="serif text-[clamp(1.65rem,2.3vw,2.15rem)] leading-[1.08] tracking-[-0.015em]">
                      {f.title}
                    </h3>
                    <p className="meta mt-2.5">
                      {f.context} · {f.span}
                    </p>

                    <p className="mt-5 max-w-[36rem] text-[1rem] leading-[1.65] text-soft">{f.summary}</p>

                    <div className="mt-7 flex items-baseline gap-4 border-t border-rule pt-5">
                      <span className="serif shrink-0 text-[2.5rem] leading-none tracking-[-0.02em] text-accent">
                        {f.fact.k}
                      </span>
                      <span className="text-[.95rem] leading-snug text-soft">{f.fact.v}</span>
                    </div>

                    <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                      {project && <p className="meta">{project.tags.join(' · ')}</p>}
                      <a href={`#p-${f.id}`} className="link text-[.9rem]">
                        Details in the index
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
