import { ROLE, TIMELINE } from '@/lib/data';

const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii'];

export default function Experience() {
  return (
    <section id="experience" className="pt-28 lg:pt-44">
      <div className="wrap grid gap-10 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-4">
          <h2 className="rv serif text-[clamp(2.4rem,4.6vw,4.2rem)] leading-none tracking-[-0.02em] lg:sticky lg:top-28">
            Experience
          </h2>
        </div>

        <div className="lg:col-span-8">
          <div className="rv flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-ink pb-6">
            <div>
              <h3 className="serif text-[clamp(1.9rem,3vw,2.6rem)] leading-none tracking-[-0.015em]">{ROLE.org}</h3>
              <p className="mt-3 text-[1.02rem]">
                {ROLE.title} <span className="text-soft">— {ROLE.team}</span>
              </p>
            </div>
            <p className="meta">
              {ROLE.span} · {ROLE.mode}
            </p>
          </div>

          <ol>
            {TIMELINE.map((x, i) => (
              <li
                key={x.t}
                className="rv grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-2 border-b border-rule py-7 md:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.25fr)] md:gap-x-8"
              >
                <span className="meta pt-[.2rem] italic">{ROMAN[i]}.</span>
                <h4 className="text-[1.08rem] font-medium leading-snug">{x.t}</h4>
                <p className="col-start-2 text-[.97rem] leading-[1.65] text-soft md:col-start-3 md:row-start-1">
                  {x.d}
                </p>
              </li>
            ))}
          </ol>

          <p className="rv meta mt-6">
            Also on the record: <span className="text-ink">{ROLE.event}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
