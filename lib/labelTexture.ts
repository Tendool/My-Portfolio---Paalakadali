"use client";

import * as THREE from "three";

/**
 * Renders a HUD badge to an offscreen 2D canvas and hands back a texture.
 *
 * Doing labels this way (instead of an SDF text library) means the 3D orbit
 * uses the exact same typeface and chrome as the rest of the page, needs
 * no extra font download, and costs one draw call per node.
 */

export type BadgeTone = "core" | "prof" | "work";

const TONES: Record<
  BadgeTone,
  { rim: string; glow: string; text: string; fill: string }
> = {
  core: {
    rim: "rgba(139,92,246,0.95)",
    glow: "rgba(139,92,246,0.8)",
    text: "#8b5cf6",
    fill: "rgba(139,92,246,0.16)",
  },
  prof: {
    rim: "rgba(255,255,255,0.6)",
    glow: "rgba(255,255,255,0.45)",
    text: "#f4f5f7",
    fill: "rgba(255,255,255,0.08)",
  },
  work: {
    rim: "rgba(255,255,255,0.26)",
    glow: "rgba(255,255,255,0.18)",
    text: "rgba(244,245,247,0.7)",
    fill: "rgba(255,255,255,0.035)",
  },
};

const W = 512;
const H = 132;
/** Corner radius, matching the `.sticker` pills across the DOM. */
const RADIUS = 46;

function pillPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const r = Math.min(RADIUS, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function createBadgeTexture(
  label: string,
  tone: BadgeTone,
  hot = false,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const t = TONES[tone];

  const pad = 10;
  const x = pad;
  const y = pad;
  const w = W - pad * 2;
  const h = H - pad * 2;

  // Plate
  pillPath(ctx, x, y, w, h);
  ctx.fillStyle = hot ? t.fill.replace(/[\d.]+\)$/, "0.42)") : t.fill;
  ctx.fill();

  // Neon rim with an outer bloom
  ctx.shadowColor = t.glow;
  ctx.shadowBlur = hot ? 26 : 14;
  ctx.strokeStyle = t.rim;
  ctx.lineWidth = hot ? 3.5 : 2.2;
  pillPath(ctx, x, y, w, h);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Label — Chakra Petch is already loaded by next/font, so it is available to
  // the 2D context by family name; the stack degrades gracefully if not.
  const text = label.toUpperCase();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = t.text;
  if ("letterSpacing" in ctx) ctx.letterSpacing = "1px";

  // Shrink to fit rather than clip: "Multi-Agent Systems" is a lot longer than "C".
  let size = 46;
  do {
    ctx.font = `600 ${size}px "IBM Plex Mono", ui-monospace, monospace`;
    if (ctx.measureText(text).width <= w - 44) break;
    size -= 2;
  } while (size > 20);

  ctx.shadowColor = t.glow;
  ctx.shadowBlur = hot ? 18 : 8;
  ctx.fillText(text, W / 2, H / 2 + 1);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

/** Fonts load asynchronously; drawing before they land yields a fallback face. */
export function whenFontsReady(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  if (!("fonts" in document)) return Promise.resolve();
  return document.fonts.ready.then(() => undefined);
}
