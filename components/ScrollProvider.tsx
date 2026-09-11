"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useQuality } from "@/lib/quality";

gsap.registerPlugin(ScrollTrigger);

/**
 * Wires Lenis' inertial scrolling into GSAP's ticker so ScrollTrigger and the
 * smooth scroll agree on the frame clock. Without this they run on separate
 * loops and pinned/scrubbed animations lag a frame behind the page.
 *
 * Lenis is desktop-only on purpose: mobile browsers already have excellent
 * native momentum scrolling, and overriding it costs frames and breaks the
 * URL-bar collapse behaviour.
 */
export default function ScrollProvider() {
  const q = useQuality();

  useEffect(() => {
    if (!q.ready) return;

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const useLenis = !q.reduced && !coarse && q.tier !== "low";

    let lenis: Lenis | null = null;
    let onTick: ((time: number) => void) | null = null;

    if (useLenis) {
      lenis = new Lenis({
        duration: 1.15,
        // Exponential ease-out: fast pickup, long glide — the "piloting" feel.
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 0.95,
        touchMultiplier: 1.6,
      });

      lenis.on("scroll", ScrollTrigger.update);

      onTick = (time: number) => {
        // GSAP's ticker reports seconds, Lenis expects milliseconds.
        lenis!.raf(time * 1000);
      };
      gsap.ticker.add(onTick);
      gsap.ticker.lagSmoothing(0);
    }

    // Anchor navigation has to go through Lenis, or the browser's own jump
    // fights the smooth scroll and lands in the wrong place.
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]',
      );
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const offset = -84; // clears the fixed header
      if (lenis)
        lenis.scrollTo(target as HTMLElement, { offset, duration: 1.4 });
      else {
        const y =
          (target as HTMLElement).getBoundingClientRect().top +
          window.scrollY +
          offset;
        window.scrollTo({ top: y, behavior: q.reduced ? "auto" : "smooth" });
      }
    };
    document.addEventListener("click", onClick);

    // Late-loading images (the album) change document height under ScrollTrigger.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const refreshTimer = window.setTimeout(refresh, 800);

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("load", refresh);
      window.clearTimeout(refreshTimer);
      if (onTick) gsap.ticker.remove(onTick);
      lenis?.destroy();
    };
  }, [q.ready, q.reduced, q.tier]);

  return null;
}
