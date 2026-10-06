import { PROFILE, ROLE } from '@/lib/data';
import Figure from './figures/Figure';
import LocalTime from './LocalTime';

const d = (s: number) => ({ ['--d' as string]: `${s}s` });

export default function Hero() {
  return (
    <section id="top" className="pt-16">
      <div className="wrap flex min-h-[calc(100svh-4rem)] flex-col">
        <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-12 lg:gap-6 lg:py-10">
          <div className="lg:col-span-6">
            <p className="meta fade-in mb-8" style={d(0.05)}>
              {PROFILE.role} — agentic systems, data pipelines &amp; applied deep learning
            </p>

            <h1 className="serif text-[clamp(2.7rem,5.3vw,5.5rem)] leading-[0.96] tracking-[-0.028em]">
              <span className="line">
                <span style={d(0.1)}>I build AI that</span>
              </span>
              <span className="line">
                <span style={d(0.2)}>has to work</span>
              </span>
              <span className="line">
                <span style={d(0.3)}>
                  <em>outside the notebook.</em>
                </span>
              </span>
            </h1>

            <p className="fade-in mt-9 max-w-[35rem] text-[1.1rem] leading-[1.65] text-soft" style={d(0.55)}>
              Agents, vision systems and small language models, and the data pipelines underneath
              them — taken all the way to the device in someone’s hand. Currently an AI intern at{' '}
              {ROLE.org}, and finishing a B.Tech in AI &amp; Data Science.
            </p>

            <div className="fade-in mt-10 flex flex-wrap items-center gap-x-7 gap-y-4" style={d(0.7)}>
              <a href="#work" className="btn">
                Selected work
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                  <path d="M8 2v12M3 9l5 5 5-5" />
                </svg>
              </a>
              <a href={`mailto:${PROFILE.email}`} className="link text-[.98rem]">
                {PROFILE.email}
              </a>
            </div>
          </div>

          {/* data-figure-card: hovering re-inks the card in the accent and spins its fans up. */}
          <div data-figure-card className="fade-in lg:col-span-6 lg:-mr-4">
            <Figure
              kind="gpu"
              label="A graphics card drawn in dither dots. Every few seconds it lifts apart into an exploded view — shroud and fans, heatsink, then the board with the GPU die and memory — and settles back together. Drag it to turn it."
              slotClassName="aspect-[6/5] cursor-grab touch-pan-y select-none data-[dragging]:cursor-grabbing"
            />
          </div>
        </div>

        <dl className="fade-in grid grid-cols-2 gap-x-6 gap-y-6 border-t border-rule py-6 text-[.95rem] md:grid-cols-4" style={d(0.9)}>
          <div>
            <dt className="meta mb-1.5">Now</dt>
            <dd>
              {ROLE.title}, {ROLE.org}
              <span className="block text-soft">since Sep 2025</span>
            </dd>
          </div>
          <div>
            <dt className="meta mb-1.5">Studying</dt>
            <dd>
              B.Tech, AI &amp; Data Science
              <span className="block text-soft">ASE Coimbatore · 2027</span>
            </dd>
          </div>
          <div>
            <dt className="meta mb-1.5">Based in</dt>
            <dd>
              Bobbili, Andhra Pradesh
              <span className="block text-soft">
                <LocalTime /> local time
              </span>
            </dd>
          </div>
          <div>
            <dt className="meta mb-1.5 flex items-center gap-2">
              <span className="pulse h-[6px] w-[6px] rounded-full bg-accent" aria-hidden />
              Open to
            </dt>
            <dd>
              AI/ML &amp; data engineering roles
              <span className="block text-soft">Available now</span>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
