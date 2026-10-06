import { FOCUS, ROLE } from '@/lib/data';
import Portrait from './Portrait';

export default function About() {
  return (
    <section id="about" className="pt-28 lg:pt-44">
      <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-6">
        <div className="rv lg:col-span-4">
          <div className="max-w-[24rem] lg:sticky lg:top-28">
            <Portrait />
          </div>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <h2 className="rv serif border-b border-rule pb-6 text-[clamp(2.4rem,4.6vw,4.2rem)] leading-none tracking-[-0.02em]">
            About
          </h2>

          <p className="rv serif mt-9 text-[clamp(1.45rem,2.2vw,1.95rem)] leading-[1.3] tracking-[-0.01em]">
            I’m Tendool, an AI/ML and data engineer. The part I like best is what happens after the
            notebook — when a model has to answer a real question, run on real hardware, and be trusted by
            someone who will never read the code.
          </p>

          <div className="rv mt-8 grid gap-5 text-[1.02rem] leading-[1.7] text-soft md:grid-cols-2 md:gap-8">
            <p>
              Since September 2025 I’ve been an AI intern at {ROLE.org}, working on small language models,
              graph-backed multi-agent systems and real-time voice agents for enterprise use. Alongside it
              I’m finishing a B.Tech in Artificial Intelligence &amp; Data Science at ASE, Coimbatore.
            </p>
            <p>
              Before that came university projects across quantum ML, healthcare data pipelines, robotics
              and agriculture. They taught me to care about the unglamorous parts: clean data, honest
              baselines, and testing against real inputs instead of mocks. I’m based in Bobbili, Andhra
              Pradesh, and work remotely.
            </p>
          </div>

          <h3 className="rv meta caps mt-16 border-b border-rule pb-3">What I work on</h3>
          <ol className="grid md:grid-cols-2 md:gap-x-8">
            {FOCUS.map((f, i) => (
              <li key={f.title} className="rv border-b border-rule py-6" style={{ ['--d' as string]: `${(i % 2) * 0.06}s` }}>
                <div className="flex items-baseline gap-3">
                  <span className="meta tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <h4 className="text-[1.06rem] font-medium leading-snug">{f.title}</h4>
                </div>
                <p className="mt-2 pl-[1.85rem] text-[.95rem] leading-[1.6] text-soft">{f.impact}</p>
                <p className="meta mt-3 pl-[1.85rem]">{f.flagship}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
