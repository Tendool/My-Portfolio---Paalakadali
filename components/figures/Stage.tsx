'use client';

import { useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { View } from '@react-three/drei';
import { palette, pointer } from './dither';
import Backdrop, { backdrop } from './Backdrop';

/** Copy the figure inks out of the CSS tokens, so the theme lives in one place. */
function syncPalette() {
  const css = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  palette.uShadow.value.set(read('--fig-shadow', '#161513'));
  palette.uLit.value.set(read('--fig-lit', '#fbfaf7'));
  palette.uHotShadow.value.set(read('--fig-hot-shadow', '#dd4a1c'));
  palette.uHotLit.value.set(read('--fig-hot-lit', '#fbfaf7'));
  palette.uLineInk.value.set(read('--fig-line', '#161513'));
  palette.uHotLine.value.set(read('--fig-hot-line', '#dd4a1c'));
  backdrop.uDot.value.set(read('--dot', '#161513'));
  backdrop.uAccent.value.set(read('--accent', '#dd4a1c'));
}

/** Two CSS pixels per dither cell at any pixel ratio, so the grain never changes. */
function CellSize() {
  const dpr = useThree((s) => s.viewport.dpr);
  useEffect(() => {
    palette.uCell.value = Math.max(2, Math.round(2 * dpr));
  }, [dpr]);
  return null;
}

/**
 * One canvas for the whole page. It sits fixed behind the content: each frame
 * it first paints the dot-grid backdrop, then every <Figure> — a drei View,
 * i.e. a DOM box whose rectangle this canvas scissors and draws into. All the
 * illustrations therefore cost one WebGL context, and a figure that is
 * scrolled out of view costs nothing at all.
 */
export default function Stage() {
  const [source, setSource] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setSource(document.body);
    syncPalette();

    const themeWatch = new MutationObserver(syncPalette);
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const move = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.fine = e.pointerType === 'mouse';
      pointer.inside = true;
    };
    const leave = () => {
      pointer.inside = false;
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', move, { passive: true });
    document.documentElement.addEventListener('mouseleave', leave);

    return () => {
      themeWatch.disconnect();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', move);
      document.documentElement.removeEventListener('mouseleave', leave);
    };
  }, []);

  if (!source) return null;

  return (
    <Canvas
      aria-hidden
      eventSource={source}
      eventPrefix="client"
      dpr={[1, 2]}
      // A 1-bit image has no edges to smooth; antialiasing would only blur
      // the dots and cost fill-rate.
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}
      onCreated={() => document.documentElement.classList.add('webgl')}
    >
      <CellSize />
      <Backdrop />
      <View.Port />
    </Canvas>
  );
}
