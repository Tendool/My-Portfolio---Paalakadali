'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Container tags this wrapper is used with. All of them accept children. */
type RevealTag = 'div' | 'p' | 'h2' | 'h3' | 'li' | 'section' | 'span';

type Props = {
  children: ReactNode;
  className?: string;
  /** Seconds of delay, for staggering siblings. */
  delay?: number;
  as?: RevealTag;
  /** Distance travelled on the way in, px. */
  y?: number;
};

/**
 * Fades and lifts its child into view once, on scroll.
 *
 * Per-element triggers (rather than one batched selector) keep this correct
 * when lists are filtered and re-rendered — each instance kills its own trigger
 * on unmount instead of leaving a dangling reference to a dead node.
 */
export default function Reveal({
  children,
  className = '',
  delay = 0,
  as = 'div',
  y = 30,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // Every tag in RevealTag takes the props we pass; narrowing to one of them
  // keeps TS from collapsing the union's `children` type to `never`.
  const Tag = as as 'div';

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    const tween = gsap.fromTo(
      el,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [delay, y]);

  return (
    <Tag ref={ref} className={`reveal ${className}`}>
      {children}
    </Tag>
  );
}
