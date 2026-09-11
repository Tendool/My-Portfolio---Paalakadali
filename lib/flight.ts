"use client";

/**
 * Shared flight state for the 3D layer.
 *
 * Scroll, pointer and drag are read every frame by the WebGL scene but must
 * never trigger a React render — so they live in a module-level store that
 * listeners write to and `useFrame` reads from.
 */

export type FlightState = {
  /** 0 at the top of the document, 1 at the bottom. */
  scroll: number;
  /** Signed scroll velocity in progress-units per second. */
  velocity: number;
  /** Pointer in normalised device coords, -1..1 on both axes. */
  pointerX: number;
  pointerY: number;
  /** Accumulated drag, in radians. Yaw spins the disc, pitch tips it. */
  dragYaw: number;
  dragPitch: number;
  /** Residual spin after the pointer lifts, so the galaxy coasts. */
  spinVelocity: number;
  dragging: boolean;
  /** Index of the section currently filling the viewport. */
  section: number;
};

export const flight: FlightState = {
  scroll: 0,
  velocity: 0,
  pointerX: 0,
  pointerY: 0,
  dragYaw: 0,
  dragPitch: 0,
  spinVelocity: 0,
  dragging: false,
  section: 0,
};

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * Frame-rate independent damping. A raw `lerp(a, b, 0.1)` per frame moves twice
 * as fast at 120fps as at 60fps; this keeps the feel identical on both.
 */
export function damp(
  current: number,
  target: number,
  smoothing: number,
  delta: number,
) {
  return lerp(current, target, 1 - Math.pow(smoothing, delta));
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/** Dragging over these should do their own thing, not spin the galaxy. */
const NO_DRAG =
  'a, button, input, textarea, select, [role="dialog"], .hud, .no-drag';

let started = false;

/** Attaches the scroll, pointer and drag listeners exactly once per page load. */
export function startFlightTracking() {
  if (started || typeof window === "undefined") return () => {};
  started = true;

  let lastScroll = 0;
  let lastTime = performance.now();

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const next = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
    const now = performance.now();
    const dt = Math.max(16, now - lastTime) / 1000;
    flight.velocity = (next - lastScroll) / dt;
    flight.scroll = next;
    lastScroll = next;
    lastTime = now;
  };

  const onPointerMove = (e: PointerEvent) => {
    flight.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
    flight.pointerY = -((e.clientY / window.innerHeight) * 2 - 1);
  };

  // ---- drag to rotate ----------------------------------------------------
  let lastX = 0;
  let lastY = 0;
  let pointerId: number | null = null;

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const target = e.target as HTMLElement | null;
    // Text inside panels stays selectable and links stay clickable; the empty
    // space between and around them is the handle for the galaxy.
    if (target?.closest?.(NO_DRAG)) return;

    pointerId = e.pointerId;
    flight.dragging = true;
    flight.spinVelocity = 0;
    lastX = e.clientX;
    lastY = e.clientY;
    document.body.classList.add("is-dragging");
  };

  const onDragMove = (e: PointerEvent) => {
    if (!flight.dragging || e.pointerId !== pointerId) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;

    const yaw = dx * 0.006;
    flight.dragYaw += yaw;
    flight.spinVelocity = yaw;
    // Tipping is clamped so the disc can never be dragged fully edge-on and
    // disappear into a line.
    flight.dragPitch = clamp(flight.dragPitch + dy * 0.005, -0.85, 0.85);
  };

  const endDrag = () => {
    if (!flight.dragging) return;
    flight.dragging = false;
    pointerId = null;
    document.body.classList.remove("is-dragging");
  };

  const onTouchEnd = () => {
    flight.pointerX = 0;
    flight.pointerY = 0;
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerDown, { passive: true });
  window.addEventListener("pointermove", onDragMove, { passive: true });
  window.addEventListener("pointerup", endDrag, { passive: true });
  window.addEventListener("pointercancel", endDrag, { passive: true });
  window.addEventListener("touchend", onTouchEnd, { passive: true });
  onScroll();

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointermove", onDragMove);
    window.removeEventListener("pointerup", endDrag);
    window.removeEventListener("pointercancel", endDrag);
    window.removeEventListener("touchend", onTouchEnd);
    started = false;
  };
}
