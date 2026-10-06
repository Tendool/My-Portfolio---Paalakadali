import fs from 'node:fs';
import path from 'node:path';
import { GALLERY } from '@/lib/data';
import StageMount from '@/components/figures/StageMount';
import RevealObserver from '@/components/RevealObserver';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import SelectedWork from '@/components/SelectedWork';
import Experience from '@/components/Experience';
import ProjectIndex from '@/components/ProjectIndex';
import About from '@/components/About';
import Toolkit from '@/components/Toolkit';
import Education from '@/components/Education';
import Photographs from '@/components/Photographs';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

/** Photographs that exist on disk. A missing file is left out, never shown as a gap. */
function availablePhotos() {
  const dir = path.join(process.cwd(), 'public', 'assets', 'projects');
  return GALLERY.filter((g) => fs.existsSync(path.join(dir, g.f)));
}

export default function Page() {
  const photos = availablePhotos();
  return (
    <>
      <StageMount />
      <RevealObserver />
      <Header />
      <main>
        <Hero />
        <SelectedWork />
        <Experience />
        <ProjectIndex />
        <About />
        <Toolkit />
        <Education />
        {photos.length > 0 && <Photographs photos={photos} />}
        <Contact />
      </main>
      <Footer />
    </>
  );
}
