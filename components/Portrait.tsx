'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PROFILE } from '@/lib/data';

/** Dots across the width — about 1.6 CSS px per dot at the size this is shown. */
const COLS = 240;

function rgb(css: string, fallback: [number, number, number]): [number, number, number] {
  const m = css.trim().match(/^#([0-9a-f]{6})$/i);
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * The portrait, re-printed in two inks like the WebGL figures — computed once
 * on a small canvas and scaled up with crisp pixels.
 * Hover (or tap) to see the photograph itself.
 */
export default function Portrait() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const photo = useRef<HTMLImageElement>(null);
  const [colour, setColour] = useState(false);
  const [drawn, setDrawn] = useState(false);

  const draw = useCallback(() => {
    const img = photo.current;
    const c = canvas.current;
    if (!img || !c || !img.complete || !img.naturalWidth) return;

    const W = COLS;
    const H = Math.round((W * img.naturalHeight) / img.naturalWidth);
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(img, 0, 0, W, H);
    const frame = ctx.getImageData(0, 0, W, H);
    const px = frame.data;

    // Stretch the tonal range of the subject only (transparent pixels are
    // skipped), so a dark suit and a white shirt span the full dot range.
    const lum = new Float32Array(W * H);
    const hist = new Uint32Array(256);
    let count = 0;
    for (let i = 0; i < W * H; i++) {
      if (px[i * 4 + 3] < 128) continue;
      const l = 0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2];
      lum[i] = l;
      hist[Math.min(255, l | 0)]++;
      count++;
    }
    const pct = (p: number) => {
      let acc = 0;
      for (let v = 0; v < 256; v++) {
        acc += hist[v];
        if (acc >= count * p) return v;
      }
      return 255;
    };
    const lo = pct(0.03);
    const hi = Math.max(lo + 1, pct(0.985));

    // Normalise, then a gentle S-curve that keeps skin in the mid-tones, then
    // an unsharp mask: dithering softens edges, so they are pre-sharpened.
    const tone = new Float32Array(W * H);
    for (let i = 0; i < W * H; i++) {
      const v = Math.min(1, Math.max(0, (lum[i] - lo) / (hi - lo)));
      tone[i] = Math.pow(v, 0.9);
    }
    const sharp = new Float32Array(W * H);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let sum = 0;
        let n = 0;
        for (let j = -1; j <= 1; j++) {
          for (let k = -1; k <= 1; k++) {
            const yy = y + j;
            const xx = x + k;
            if (yy < 0 || yy >= H || xx < 0 || xx >= W) continue;
            sum += tone[yy * W + xx];
            n++;
          }
        }
        const i = y * W + x;
        sharp[i] = tone[i] + 0.9 * (tone[i] - sum / n);
      }
    }

    const css = getComputedStyle(document.documentElement);
    const ink = rgb(css.getPropertyValue('--fig-shadow'), [22, 21, 19]);
    const lit = rgb(css.getPropertyValue('--fig-lit'), [251, 250, 247]);

    // Atkinson error diffusion — the classic 1-bit Macintosh photo dither.
    // It passes on only 6/8 of each pixel's error, which keeps highlights and
    // shadows clean and gives faces far more legible features than an
    // ordered pattern does at this resolution.
    const spread: [number, number][] = [[1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [0, 2]];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        const o = i * 4;
        if (px[o + 3] < 128) {
          px[o + 3] = 0;
          continue;
        }
        const on = sharp[i] > 0.5;
        const err = (sharp[i] - (on ? 1 : 0)) / 8;
        for (const [dx, dy] of spread) {
          const xx = x + dx;
          const yy = y + dy;
          if (xx >= 0 && xx < W && yy < H) sharp[yy * W + xx] += err;
        }
        const c = on ? lit : ink;
        px[o] = c[0];
        px[o + 1] = c[1];
        px[o + 2] = c[2];
        px[o + 3] = 255;
      }
    }
    ctx.putImageData(frame, 0, 0);
    setDrawn(true);
  }, []);

  useEffect(() => {
    draw();
    const watch = new MutationObserver(draw);
    watch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => watch.disconnect();
  }, [draw]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setColour((v) => !v)}
        aria-pressed={colour}
        aria-label={colour ? 'Show the dithered portrait' : 'Show the colour photograph'}
        className="group crop relative block aspect-[1072/1157] w-full cursor-pointer p-0"
      >
        <canvas
          ref={canvas}
          aria-hidden
          className={`absolute inset-0 h-full w-full transition-opacity duration-500 [image-rendering:pixelated] ${
            drawn ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <Image
          ref={photo}
          src="/assets/profile.png"
          alt={PROFILE.full}
          fill
          sizes="(min-width: 1024px) 30vw, 90vw"
          onLoad={draw}
          className={`object-contain transition-opacity duration-500 group-hover:opacity-100 ${
            colour || !drawn ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </button>
    </div>
  );
}
