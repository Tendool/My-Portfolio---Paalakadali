import { PROFILE } from '@/lib/data';
import CopyEmail from './CopyEmail';
import LocalTime from './LocalTime';

const Arrow = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    aria-hidden
    className="inline -translate-y-px"
  >
    <path d="M3 9l6-6M4 3h5v5" />
  </svg>
);

export default function Contact() {
  return (
    <section id="contact" className="pt-32 lg:pt-52">
      <div className="wrap">
        <p className="rv meta caps mb-8">Contact</p>
        <h2 className="rv serif max-w-[15ch] text-[clamp(2.9rem,7.6vw,8rem)] leading-[0.94] tracking-[-0.03em]">
          Got something that has to work <em>outside the notebook?</em>
        </h2>

        <div className="rv mt-12 flex flex-wrap items-center gap-x-6 gap-y-4">
          <a
            href={`mailto:${PROFILE.email}?subject=${encodeURIComponent(`Hello, ${PROFILE.middle}`)}`}
            className="link serif text-[clamp(1.5rem,3.4vw,2.8rem)] leading-tight tracking-[-0.01em]"
          >
            {PROFILE.email}
          </a>
          <CopyEmail email={PROFILE.email} />
        </div>

        <dl className="rv mt-20 grid gap-x-6 gap-y-8 border-t border-ink pt-8 text-[.98rem] sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="meta mb-2">Elsewhere</dt>
            <dd className="flex flex-col items-start gap-1">
              <a href={PROFILE.github} target="_blank" rel="noopener noreferrer" className="link">
                GitHub <Arrow />
              </a>
              <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" className="link">
                LinkedIn <Arrow />
              </a>
            </dd>
          </div>
          <div>
            <dt className="meta mb-2">Phone</dt>
            <dd className="flex flex-col items-start gap-1">
              {PROFILE.phones.map((p, i) => (
                <a key={p} href={`tel:${PROFILE.tels[i]}`} className="link tabular-nums">
                  {p}
                </a>
              ))}
            </dd>
          </div>
          <div>
            <dt className="meta mb-2">Based in</dt>
            <dd>
              {PROFILE.location.town}
              <span className="block text-soft">{PROFILE.location.region}</span>
            </dd>
          </div>
          <div>
            <dt className="meta mb-2">Local time</dt>
            <dd>
              <LocalTime /> IST
              <span className="block text-soft">Available for roles now</span>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
