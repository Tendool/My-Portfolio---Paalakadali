"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type QualityTier = "low" | "mid" | "high";

export type QualitySettings = {
  tier: QualityTier;
  /** Clamp range handed to R3F's <Canvas dpr>. */
  dpr: [number, number];
  /** Particle budget for the spiral galaxy. */
  galaxyCount: number;
  /** Particle budget for the parallax starfield (per layer). */
  starCount: number;
  /** Instanced rocks in the belt the camera flies through. */
  asteroids: number;
  /** Sphere tessellation for the planet and its moons. */
  planetSegments: number;
  /** How many skills get a 3D node in the arsenal orbit. */
  orbitNodes: number;
  /** Antialiasing costs roughly 30% on integrated GPUs. */
  antialias: boolean;
  /** True when the visitor asked for reduced motion — all drift stops. */
  reduced: boolean;
  /** False until the client-side probe has run; SSR renders the safe tier. */
  ready: boolean;
};

const PRESETS: Record<
  QualityTier,
  Omit<QualitySettings, "tier" | "reduced" | "ready">
> = {
  low: {
    dpr: [1, 1.25],
    galaxyCount: 4000,
    starCount: 320,
    asteroids: 80,
    planetSegments: 32,
    orbitNodes: 14,
    antialias: false,
  },
  mid: {
    dpr: [1, 1.6],
    galaxyCount: 13000,
    starCount: 700,
    asteroids: 210,
    planetSegments: 48,
    orbitNodes: 22,
    antialias: false,
  },
  high: {
    dpr: [1, 2],
    galaxyCount: 27000,
    starCount: 1150,
    asteroids: 420,
    planetSegments: 64,
    orbitNodes: 30,
    antialias: true,
  },
};

function build(
  tier: QualityTier,
  reduced: boolean,
  ready: boolean,
): QualitySettings {
  return { tier, reduced, ready, ...PRESETS[tier] };
}

/** Best guess at what this device can sustain, before a single frame is drawn. */
function probeTier(): QualityTier {
  if (typeof window === "undefined") return "mid";

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 768;
  const cores = navigator.hardwareConcurrency ?? 4;
  // deviceMemory is Chromium-only; absence is not a signal either way.
  const mem =
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;

  if (coarse || narrow) return cores >= 8 && mem >= 6 ? "mid" : "low";
  if (cores <= 4 || mem <= 4) return "mid";
  return "high";
}

const QualityContext = createContext<QualitySettings>(
  build("mid", false, false),
);

export function useQuality() {
  return useContext(QualityContext);
}

const ORDER: QualityTier[] = ["low", "mid", "high"];

export function QualityProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<QualityTier>("mid");
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);
  // Downgrades are one-way: a device that stutters once will stutter again, and
  // oscillating between tiers is more jarring than simply staying conservative.
  const floorRef = useRef<QualityTier | null>(null);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setReduced(motionQuery.matches);
    onMotion();
    motionQuery.addEventListener("change", onMotion);

    setTier(probeTier());
    setReady(true);

    // Re-probe on resize so rotating a tablet or dragging to a second monitor
    // lands on the right budget, but never above a tier we already backed off from.
    let resizeTimer: number;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        setTier((current) => {
          const probed = probeTier();
          const floor = floorRef.current;
          if (!floor) return probed;
          return ORDER.indexOf(probed) > ORDER.indexOf(floor) ? floor : probed;
        });
      }, 250);
    };
    window.addEventListener("resize", onResize);

    // Frame watchdog: sample the first few seconds of real rendering and drop a
    // tier if we are not holding 60fps. This is the dynamic half of the scaler —
    // the probe above only guesses from device specs.
    let frames = 0;
    let start = performance.now();
    let raf = 0;
    let samples = 0;
    const sample = (now: number) => {
      frames += 1;
      const elapsed = now - start;
      if (elapsed >= 1000) {
        const fps = (frames * 1000) / elapsed;
        frames = 0;
        start = now;
        samples += 1;
        if (fps < 50) {
          setTier((current) => {
            const next = ORDER[Math.max(0, ORDER.indexOf(current) - 1)];
            floorRef.current = next;
            return next;
          });
        }
        // Four seconds is enough to catch a struggling device without keeping a
        // rAF alive for the life of the page.
        if (samples >= 4) return;
      }
      raf = requestAnimationFrame(sample);
    };
    raf = requestAnimationFrame(sample);

    return () => {
      motionQuery.removeEventListener("change", onMotion);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeTimer);
      cancelAnimationFrame(raf);
    };
  }, []);

  const value = useMemo(
    () => build(tier, reduced, ready),
    [tier, reduced, ready],
  );

  return (
    <QualityContext.Provider value={value}>{children}</QualityContext.Provider>
  );
}
