'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useQuality } from '@/lib/quality';
import { startFlightTracking } from '@/lib/flight';
import { CAMERA_START_Z } from '@/lib/stations';

// Three.js never touches the server: the whole scene graph is pulled in on the
// client only, keeping it out of the SSR payload and off the critical path.
const Universe = dynamic(() => import('./three/Universe'), { ssr: false });

/** Painted behind the canvas — what visitors see before the scene mounts, and
 *  all they see if WebGL is unavailable. */
function StaticSky() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background:
          'radial-gradient(ellipse 60% 50% at 50% 42%, rgba(255,255,255,0.07), transparent 62%),' +
          'radial-gradient(ellipse 95% 70% at 50% 42%, rgba(255,255,255,0.028), transparent 72%),' +
          '#05060a',
      }}
    />
  );
}

export default function UniverseCanvas() {
  const q = useQuality();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stop = startFlightTracking();
    // Defer the canvas briefly so first paint is the static sky and the
    // headline, not a blank hold while shaders compile.
    //
    // This is a timer rather than a rAF on purpose: rAF is suspended outright
    // in a backgrounded or occluded tab, so gating the mount on it means a
    // visitor who opens the page in a background tab can come back to a site
    // that never built its universe at all. Timers still fire (throttled), so
    // the scene is ready the moment the tab is looked at.
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => {
      window.clearTimeout(id);
      stop();
    };
  }, []);

  return (
    <>
      <StaticSky />

      <div aria-hidden className="pointer-events-none fixed inset-0 -z-[9]">
        {mounted && (
          <Canvas
            dpr={q.dpr}
            gl={{
              antialias: q.antialias,
              powerPreference: 'high-performance',
              alpha: true,
            }}
            camera={{ fov: 50, near: 0.1, far: 320, position: [0, 0, CAMERA_START_Z] }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <Universe />
          </Canvas>
        )}
      </div>

      <div aria-hidden className="vignette pointer-events-none fixed inset-0 -z-[7]" />
      <div aria-hidden className="grain pointer-events-none fixed inset-0 -z-[6]" />
    </>
  );
}
