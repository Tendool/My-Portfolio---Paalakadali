"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { useQuality } from "@/lib/quality";

type Props = {
  children: ReactNode;
  className?: string;
  camera?: {
    fov?: number;
    position?: [number, number, number];
    near?: number;
    far?: number;
  };
  /** Rendered underneath until the canvas mounts. */
  placeholder?: ReactNode;
};

/**
 * A WebGL canvas that only exists while it matters.
 *
 * It mounts the first time it comes near the viewport and pauses its render
 * loop the moment it leaves, so the hero core and the arsenal orbit are never
 * both burning frames at once — the page holds at most two live contexts,
 * counting the always-on cosmic background.
 */
export default function LazyCanvas({
  children,
  className,
  camera,
  placeholder,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const q = useQuality();

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setMounted(true);
        setActive(entry.isIntersecting);
      },
      // Mount a little early so shaders are compiled by the time it scrolls in.
      { rootMargin: "300px 0px", threshold: 0.01 },
    );
    io.observe(el);

    // A backgrounded tab should not render at all.
    const onVisibility = () => {
      if (document.hidden) setActive(false);
      else if (hostRef.current) {
        const r = hostRef.current.getBoundingClientRect();
        setActive(r.bottom > 0 && r.top < window.innerHeight);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div ref={hostRef} className={className}>
      {!mounted && placeholder}
      {mounted && (
        <Canvas
          frameloop={active && !q.reduced ? "always" : "demand"}
          dpr={q.dpr}
          gl={{
            antialias: q.antialias,
            powerPreference: "high-performance",
            alpha: true,
          }}
          camera={{ fov: 45, position: [0, 0, 6], ...camera }}
          style={{ position: "absolute", inset: 0 }}
        >
          {children}
        </Canvas>
      )}
    </div>
  );
}
