import Image from 'next/image';
import type { GALLERY } from '@/lib/data';

/**
 * Project photographs. Only rendered when at least one file from GALLERY is
 * actually present in /public/assets/projects — see app/page.tsx.
 */
export default function Photographs({ photos }: { photos: typeof GALLERY }) {
  return (
    <section id="photographs" className="pt-28 lg:pt-44">
      <div className="wrap">
        <div className="rv flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-6">
          <h2 className="serif text-[clamp(2.4rem,4.6vw,4.2rem)] leading-none tracking-[-0.02em]">
            From the bench
          </h2>
          <p className="meta">{photos.length} photographs</p>
        </div>
        <div className="grid gap-x-8 gap-y-12 pt-12 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((p, i) => (
            <figure key={p.f} className="rv" style={{ ['--d' as string]: `${(i % 3) * 0.06}s` }}>
              <div className="relative aspect-[16/10] overflow-hidden bg-raised">
                <Image
                  src={`/assets/projects/${p.f}`}
                  alt={p.cap}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="meta mt-3 flex gap-3">
                <span className="shrink-0 text-ink">Pl. {i + 1}</span>
                <span>
                  {p.tag} — {p.cap}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
