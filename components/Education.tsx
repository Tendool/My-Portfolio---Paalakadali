import { EDU } from '@/lib/data';

export default function Education() {
  return (
    <section id="education" className="pt-28 lg:pt-44">
      <div className="wrap grid gap-10 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-4">
          <h2 className="rv serif text-[clamp(2.4rem,4.6vw,4.2rem)] leading-none tracking-[-0.02em]">Education</h2>
        </div>

        <ol className="border-t border-ink lg:col-span-8">
          {EDU.map((e, i) => (
            <li
              key={e.s}
              className="rv grid grid-cols-[4.5rem_1fr] gap-x-4 gap-y-1 border-b border-rule py-7 md:grid-cols-[6rem_minmax(0,1fr)_auto] md:gap-x-8"
              style={{ ['--d' as string]: `${i * 0.06}s` }}
            >
              <span className="serif text-[1.7rem] leading-none tabular-nums">{e.y}</span>
              <div>
                <h3 className="text-[1.08rem] font-medium leading-snug">{e.s}</h3>
                <p className="mt-1 text-[.96rem] text-soft">{e.d}</p>
              </div>
              <p className="meta col-start-2 mt-2 md:col-start-3 md:mt-1 md:text-right">
                {e.m}
                {e.live && <span className="block text-accent-ink">In progress</span>}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
