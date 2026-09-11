'use client';

import UniverseCanvas from '@/components/UniverseCanvas';
import ScrollProvider from '@/components/ScrollProvider';
import Cursor from '@/components/Cursor';
import BodyReadout from '@/components/BodyReadout';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import Roster from '@/components/Roster';
import MissionLog from '@/components/MissionLog';
import MissionFiles from '@/components/MissionFiles';
import Album from '@/components/Album';
import Arsenal from '@/components/Arsenal';
import Origin from '@/components/Origin';
import Contact from '@/components/Contact';
import { PROFILE } from '@/lib/data';

const CAPABILITIES = [
  'Agentic AI',
  'LLM Systems',
  'RAG',
  'Computer Vision',
  'Deep Learning',
  'Quantum ML',
  'Robotics',
  'Big Data',
];

const DOMAINS = ['Healthcare', 'Agriculture', 'Robotics', 'Enterprise', 'Energy', 'Research'];

export default function Page() {
  return (
    <>
      <UniverseCanvas />
      <ScrollProvider />
      <Cursor />
      <BodyReadout />
      <Nav />

      <main>
        <Hero />

        <Marquee
          items={CAPABILITIES}
          tone="accent"
          speed={26}
          depth
          reverse
          className="py-8 text-[clamp(.95rem,1.8vw,1.45rem)]"
        />

        <Roster />
        <MissionLog />
        <MissionFiles />

        <Marquee
          items={DOMAINS}
          tone="quiet"
          label="Domains"
          speed={52}
          className="py-7 text-[clamp(1.05rem,2vw,1.6rem)]"
        />

        <Album />
        <Arsenal />
        <Origin />
        <Contact />
      </main>

      <footer className="relative z-10 border-t border-white/10 px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-[1320px] flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="label !text-[.62rem]">{PROFILE.full} — AI/ML Engineer</p>
          <p className="label !text-[.62rem]">B.Tech AI &amp; Data Science · Class of 2027</p>
        </div>
      </footer>
    </>
  );
}
