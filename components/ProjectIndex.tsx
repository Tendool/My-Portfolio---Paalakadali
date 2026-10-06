'use client';

import { useEffect, useMemo, useState } from 'react';
import { FILTERS, PROJECTS, startOf, type Category } from '@/lib/data';

type Filter = Category | 'all';

const SORTED = [...PROJECTS].sort((a, b) => startOf(b.t) - startOf(a.t));

const COUNTS = Object.fromEntries(
  FILTERS.map(([k]) => [k, k === 'all' ? PROJECTS.length : PROJECTS.filter((p) => p.c.includes(k)).length]),
) as Record<Filter, number>;

const COLS = 'md:grid-cols-[4.5rem_minmax(0,1.7fr)_minmax(0,.75fr)_minmax(0,1fr)_1.5rem]';

export default function ProjectIndex() {
  const [filter, setFilter] = useState<Filter>('all');
  const [open, setOpen] = useState<string | null>(null);

  const shown = useMemo(
    () => (filter === 'all' ? SORTED : SORTED.filter((p) => p.c.includes(filter))),
    [filter],
  );

  // "Details in the index" links land here as #p-<id>: clear any filter that
  // would hide the row, open it, and bring it into view.
  useEffect(() => {
    const go = () => {
      const m = window.location.hash.match(/^#p-(.+)$/);
      if (!m || !PROJECTS.some((p) => p.id === m[1])) return;
      setFilter('all');
      setOpen(m[1]);
      window.setTimeout(() => document.getElementById(`p-${m[1]}`)?.scrollIntoView({ block: 'start' }), 0);
    };
    go();
    window.addEventListener('hashchange', go);
    return () => window.removeEventListener('hashchange', go);
  }, []);

  return (
    <section id="index" className="pt-28 lg:pt-44">
      <div className="wrap">
        <div className="rv flex flex-col gap-6 border-b border-rule pb-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="serif text-[clamp(2.4rem,4.6vw,4.2rem)] leading-none tracking-[-0.02em]">
            Index <span className="text-muted">of projects</span>
          </h2>

          <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-2">
            {FILTERS.map(([k, label]) => {
              const on = filter === k;
              return (
                <button
                  key={k}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(k)}
                  className={`flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[.88rem] transition-colors duration-200 ${
                    on ? 'border-ink bg-ink text-paper' : 'border-rule text-soft hover:border-ink hover:text-ink'
                  }`}
                >
                  {label}
                  <span className={`font-mono text-[.68rem] ${on ? 'opacity-70' : 'text-muted'}`}>{COUNTS[k]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={`meta caps hidden gap-x-6 border-b border-rule py-3 md:grid ${COLS}`} aria-hidden>
          <span>Year</span>
          <span>Project</span>
          <span>Context</span>
          <span>Stack</span>
          <span />
        </div>

        <ul aria-live="polite">
          {shown.map((p) => {
            const isOpen = open === p.id;
            const panel = `panel-${p.id}`;
            return (
              <li key={p.id} id={`p-${p.id}`} className="border-b border-rule">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : p.id)}
                  aria-expanded={isOpen}
                  aria-controls={panel}
                  className={`group grid w-full grid-cols-[3.25rem_minmax(0,1fr)_1.5rem] items-baseline gap-x-4 py-5 text-left md:gap-x-6 ${COLS}`}
                >
                  <span className="meta tabular-nums">{Math.floor(startOf(p.t))}</span>
                  <span className="text-[1.06rem] font-medium leading-snug transition-colors duration-200 group-hover:text-accent-ink">
                    {p.n}
                    <span className="mt-1 block text-[.88rem] font-normal text-soft md:hidden">{p.o}</span>
                  </span>
                  <span className="hidden text-[.93rem] text-soft md:block">{p.o}</span>
                  <span className="meta hidden truncate md:block">{p.tags.slice(0, 3).join(', ')}</span>
                  <span
                    aria-hidden
                    className={`relative h-3 w-3 self-center justify-self-end transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
                  >
                    <span className="absolute left-0 top-1/2 h-px w-3 bg-current" />
                    <span className="absolute left-1/2 top-0 h-3 w-px bg-current" />
                  </span>
                </button>

                <div
                  id={panel}
                  className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.2,.7,.2,1)]"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden" inert={!isOpen}>
                    <div className={`grid gap-x-6 gap-y-6 pb-9 md:grid ${COLS}`}>
                      <span className="hidden md:block" />
                      <ul className="flex flex-col gap-3 text-[.98rem] leading-[1.65] text-soft md:col-span-2">
                        {p.b.map((line) => (
                          <li key={line} className="flex gap-3">
                            <span className="mt-[.7rem] h-px w-3 shrink-0 bg-accent" aria-hidden />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                      <dl className="flex flex-col gap-4 text-[.92rem] md:col-span-2">
                        <div>
                          <dt className="meta">Period</dt>
                          <dd>{p.t}</dd>
                        </div>
                        <div>
                          <dt className="meta">Stack</dt>
                          <dd>{p.tags.join(', ')}</dd>
                        </div>
                        {p.conf && (
                          <div>
                            <dt className="meta">Note</dt>
                            <dd className="text-soft">Client project — internal name withheld.</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
