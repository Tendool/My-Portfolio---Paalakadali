import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useMemo, type RefObject } from 'react';

/**
 * Inks shared by every figure. Each material holds a reference to these exact
 * uniform objects, so re-inking for the dark theme is eight assignments here
 * rather than a walk over every material on the page.
 */
export const palette = {
  uShadow: { value: new THREE.Color('#161513') },
  uLit: { value: new THREE.Color('#fbfaf7') },
  uHotShadow: { value: new THREE.Color('#dd4a1c') },
  uHotLit: { value: new THREE.Color('#fbfaf7') },
  /** Solid ink for line-work (edges, rings, axes): dark on paper, light on the dark theme. */
  uLineInk: { value: new THREE.Color('#161513') },
  uHotLine: { value: new THREE.Color('#dd4a1c') },
  /** Edge of one dither cell, in framebuffer pixels (2 CSS px × DPR). */
  uCell: { value: 2 },
};

/** Last known pointer, in client px. `fine` is false for touch and pen. */
export const pointer = { x: 0, y: 0, fine: false, inside: false };

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const vertex = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec4 local = vec4(position, 1.0);
    vec3 nrm = normal;
    #ifdef USE_INSTANCING
      // Instanced parts (the network's edges) are line-work, so the normal
      // only needs to be roughly right.
      local = instanceMatrix * local;
      nrm = mat3(instanceMatrix) * nrm;
    #endif
    vec4 mv = modelViewMatrix * local;
    // normalMatrix keeps normals right under the non-uniform scales the
    // voice bars use. Everything is lit in view space, and the camera never
    // turns, so "towards the cursor" is simply +z plus the cursor offset.
    vN = normalize(normalMatrix * nrm);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uShadow;
  uniform vec3 uLit;
  uniform vec3 uHotShadow;
  uniform vec3 uHotLit;
  uniform vec3 uLineInk;
  uniform vec3 uHotLine;
  uniform vec3 uLight;
  uniform float uCell;
  uniform float uHot;
  uniform float uBias;
  uniform float uLine;
  varying vec3 vN;
  varying vec3 vV;

  // Recursive Bayer matrix. Each level halves the cell and adds a quarter of
  // the next threshold, giving the classic 8x8 ordered-dither pattern with
  // 64 grey levels and no lookup table.
  float bayer2(vec2 a) {
    a = mod(floor(a), 2.0);
    return fract(dot(a, vec2(0.5, a.y * 0.75)));
  }
  float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
  float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

  void main() {
    if (uLine > 0.5) {
      gl_FragColor = vec4(mix(uLineInk, uHotLine, uHot), 1.0);
      #include <colorspace_fragment>
      return;
    }
    vec3 n = normalize(vN);
    // three.js draws BackSide by flipping the winding, so those fragments
    // still report gl_FrontFacing — it defines FLIP_SIDED for that case.
    #ifdef FLIP_SIDED
      n = -n;
    #endif
    #ifdef DOUBLE_SIDED
      if (!gl_FrontFacing) n = -n;
    #endif
    vec3 v = normalize(vV);
    vec3 l = normalize(uLight);

    float ndl = dot(n, l);
    float diffuse = max(ndl, 0.0);
    float wrap = ndl * 0.5 + 0.5;
    float spec = pow(max(dot(n, normalize(l + v)), 0.0), 42.0);
    // Darken toward the silhouette so a shape stays legible even where the
    // lit ink is nearly the colour of the paper behind it.
    float rim = pow(1.0 - max(dot(n, v), 0.0), 2.2);

    float tone = 0.06 + 0.6 * diffuse + 0.22 * wrap + 0.5 * spec - 0.42 * rim + uBias;
    float threshold = bayer8(gl_FragCoord.xy / uCell);

    vec3 shadow = mix(uShadow, uHotShadow, uHot);
    vec3 lit = mix(uLit, uHotLit, uHot);
    gl_FragColor = vec4(tone > threshold ? lit : shadow, 1.0);
    #include <colorspace_fragment>
  }
`;

export type FigureUniforms = {
  uLight: { value: THREE.Vector3 };
  uHot: { value: number };
};

/**
 * A dither material wired to the shared inks and to one figure's light.
 * `bias` brightens (+) or darkens (−) a part: the pupil is −1, i.e. solid ink.
 */
export function makeDither(
  u: FigureUniforms,
  bias = 0,
  side: THREE.Side = THREE.FrontSide,
  line = false,
) {
  return new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    side,
    uniforms: {
      ...palette,
      uLight: u.uLight,
      uHot: u.uHot,
      uBias: { value: bias },
      uLine: { value: line ? 1 : 0 },
    },
  });
}

/**
 * Undithered line-work. Shading thin parts would only break them into dots,
 * and the shadow ink vanishes on the dark theme, so lines get their own ink.
 */
export const makeLine = (u: FigureUniforms) => makeDither(u, 0, THREE.FrontSide, true);

const target = new THREE.Vector3();

/**
 * Per-figure lighting. Every frame the light swings towards wherever the
 * cursor is relative to this figure's own box, so all figures on screen are
 * lit consistently by one moving lamp. With no mouse it drifts on its own.
 *
 * `uHot` eases towards 1 while the figure's card is hovered or focused, which
 * re-inks the drawing in the accent.
 */
export function useFigure(host: RefObject<HTMLElement | null>) {
  const uniforms = useMemo<FigureUniforms>(
    () => ({ uLight: { value: new THREE.Vector3(0.5, 0.6, 1).normalize() }, uHot: { value: 0 } }),
    [],
  );

  useFrame((state, dt) => {
    const el = host.current;
    if (!el) return;
    const k = 1 - Math.exp(-dt * 5);

    if (pointer.fine && pointer.inside) {
      const r = el.getBoundingClientRect();
      const dx = (pointer.x - (r.left + r.width / 2)) / (r.width * 0.55);
      const dy = -(pointer.y - (r.top + r.height / 2)) / (r.height * 0.55);
      target.set(THREE.MathUtils.clamp(dx, -2.2, 2.2), THREE.MathUtils.clamp(dy, -2.2, 2.2), 1.1);
    } else {
      const t = state.clock.elapsedTime * 0.35;
      target.set(Math.cos(t) * 0.9, 0.55 + Math.sin(t * 1.3) * 0.35, 1.1);
    }
    uniforms.uLight.value.lerp(target.normalize(), k).normalize();

    const card = el.closest('[data-figure-card]');
    const hot = card ? card.matches(':hover, :focus-within') : false;
    uniforms.uHot.value += ((hot ? 1 : 0) - uniforms.uHot.value) * (1 - Math.exp(-dt * 7));
  });

  return uniforms;
}
