'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { flight, damp, clamp } from '@/lib/flight';
import { useQuality } from '@/lib/quality';
import { STATIONS, BODIES, cameraZ, proximity, type StationId } from '@/lib/stations';
import Galaxy from './Galaxy';
import { Body, Sun } from './Bodies';
import { AsteroidBelt, Satellite, DataCore, Beacon } from './Constructs';

const ACCENT = '#8b5cf6';

/** Rendered in real orbital order; the belt sits between Mars and Jupiter. */
const PLANETS: StationId[] = [
  'mercury',
  'venus',
  'earth',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
];

/* ==========================================================================
   SKY
   The star field the whole journey happens inside. It rides with the camera,
   so however far the flight travels the stars never run out behind it.
   ========================================================================== */

function Sky({ count, reduced }: { count: number; reduced: boolean }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      // Even distribution on a shell, not through the volume, so density does
      // not pile up toward the centre.
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 90 + Math.random() * 60;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame(({ camera }, delta) => {
    const p = ref.current;
    if (!p) return;
    // Lock to the camera so the shell can never be flown out of.
    p.position.copy(camera.position);
    if (reduced) return;
    const d = Math.min(delta, 0.05);
    p.rotation.y = damp(p.rotation.y, flight.pointerX * 0.03, 0.02, d);
    p.rotation.x = damp(p.rotation.x, flight.pointerY * 0.02, 0.02, d);
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.42}
        sizeAttenuation
        color="#c2c9d6"
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        // Fog would swallow the sky shell entirely; it is meant to be infinite.
        fog={false}
      />
    </points>
  );
}

/* ==========================================================================
   CAMERA
   Scroll drives depth. The camera always looks a fixed distance ahead of
   itself, and leans toward whichever station it is passing — so objects get
   "noticed" rather than sliding by in peripheral vision.
   ========================================================================== */

function FlightCamera({ reduced, lateral }: { reduced: boolean; lateral: number }) {
  const { camera } = useThree();
  const lateralRef = useRef(lateral);
  lateralRef.current = lateral;
  const progress = useRef(0);
  const look = useRef(new THREE.Vector3(0, 0, 2));
  const target = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05);

    if (reduced) {
      camera.position.set(0, 0, cameraZ(flight.scroll));
      camera.lookAt(0, 0, cameraZ(flight.scroll) - 24);
      return;
    }

    // Damping the progress value rather than the position keeps the speed
    // along the route smooth — that is what makes it feel flown rather than
    // scrubbed.
    progress.current = damp(progress.current, flight.scroll, 0.0006, d);
    const p = clamp(progress.current, 0, 1);

    // Lean toward the station currently alongside.
    let leanX = 0;
    let leanY = 0;
    for (const s of STATIONS) {
      const w = proximity(p, s.at);
      if (w <= 0) continue;
      leanX += s.position[0] * lateralRef.current * w * 0.3;
      leanY += s.position[1] * lateralRef.current * w * 0.34;
    }

    const z = cameraZ(p);
    target.current.set(
      leanX * 0.35 + flight.pointerX * 1.1,
      leanY * 0.35 + flight.pointerY * 0.7 + p * 1.2,
      z,
    );
    camera.position.lerp(target.current, 1 - Math.pow(0.004, d));

    // Look ahead down the corridor, biased toward the passing station.
    look.current.set(leanX, leanY, z - 24);
    camera.lookAt(look.current);

    // A little roll into the direction of travel.
    camera.rotation.z = damp(
      camera.rotation.z,
      -flight.pointerX * 0.05 + clamp(flight.velocity, -1, 1) * 0.06,
      0.02,
      d,
    );
  });

  return null;
}

/* ==========================================================================
   A station only animates while the camera is near it. Everything stays
   mounted — remounting would recompile shaders mid-scroll — but the objects
   far up or down the corridor stop doing per-frame work.
   ========================================================================== */

function Station({
  at,
  position,
  lateral,
  children,
}: {
  at: number;
  position: [number, number, number];
  /** Horizontal squeeze for narrow viewports. See `useLateralScale`. */
  lateral: number;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    // Narrow on purpose: with fourteen stations along the corridor a generous
    // window puts three bodies on screen at once — and, at the very top, the
    // Sun behind the hero headline where it has no business being.
    g.visible = proximity(flight.scroll, at, 0.075) > 0;
  });

  return (
    <group ref={ref} position={[position[0] * lateral, position[1] * lateral, position[2]]}>
      {children}
    </group>
  );
}

/* ========================================================================== */

/**
 * Offsets are authored for a wide desktop frame. A phone's frustum is a third
 * as wide in world units at the same depth, so the same offsets would park
 * every planet out of shot — squeeze them toward the axis instead.
 */
function useLateralScale() {
  const { size } = useThree();
  const aspect = size.width / Math.max(1, size.height);
  return clamp(aspect / 1.62, 0.3, 1);
}

export default function Universe() {
  const q = useQuality();
  const lateral = useLateralScale();

  // Only the placement travels to <Station>; the id is just the lookup key.
  const station = (id: StationId) => {
    const s = STATIONS.find((x) => x.id === id)!;
    return { at: s.at, position: s.position };
  };

  return (
    <>
      {/* Exponential fog pulls each construct out of the dark as it nears,
          which also hides the moment it starts being drawn. */}
      <fogExp2 attach="fog" args={['#05060a', 0.006]} />

      <FlightCamera reduced={q.reduced} lateral={lateral} />
      <Sky count={q.starCount} reduced={q.reduced} />

      <ambientLight intensity={0.35} />

      <Station {...station('galaxy')} lateral={lateral}>
        <Galaxy count={q.galaxyCount} reduced={q.reduced} />
      </Station>

      <Station {...station('sun')} lateral={lateral}>
        <Sun segments={q.planetSegments} reduced={q.reduced} accent={ACCENT} />
      </Station>

      {PLANETS.map((id) => (
        <Station key={id} {...station(id)} lateral={lateral}>
          <Body
            spec={BODIES[id]}
            segments={q.planetSegments}
            reduced={q.reduced}
            accent={ACCENT}
          />
        </Station>
      ))}

      <Station {...station('belt')} lateral={lateral}>
        <AsteroidBelt count={q.asteroids} reduced={q.reduced} />
      </Station>

      <Station {...station('satellite')} lateral={lateral}>
        <Satellite reduced={q.reduced} />
      </Station>

      <Station {...station('core')} lateral={lateral}>
        <DataCore reduced={q.reduced} accent={ACCENT} />
      </Station>

      <Station {...station('beacon')} lateral={lateral}>
        <Beacon reduced={q.reduced} accent={ACCENT} />
      </Station>
    </>
  );
}
