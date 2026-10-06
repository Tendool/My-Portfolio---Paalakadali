'use client';

import * as THREE from 'three';
import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { pointer, reducedMotion } from './dither';

/** Dot-grid colours, read from the theme tokens by Stage. */
export const backdrop = {
  uDot: { value: new THREE.Color('#161513') },
  uAccent: { value: new THREE.Color('#dd4a1c') },
};

const fragment = /* glsl */ `
  uniform vec2 uRes;
  uniform vec2 uPointer;
  uniform float uNear;
  uniform float uTime;
  uniform float uDpr;
  uniform vec3 uDot;
  uniform vec3 uAccent;

  void main() {
    // Top-left origin, device pixels.
    vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
    float S = 40.0 * uDpr;
    vec2 cell = floor(p / S);
    vec2 centre = (cell + 0.5) * S;

    // At rest the grid is barely there. A slow diagonal swell passes over it
    // now and then, and only its crest shows — a soft band of dots drifting
    // across an otherwise clean sheet.
    float crest = smoothstep(0.7, 1.0, sin(dot(cell, vec2(0.15, 0.09)) - uTime * 0.4));

    // Near the cursor dots grow, lean away from it and warm to the accent.
    vec2 away = centre - uPointer;
    float d = length(away);
    float R = 170.0 * uDpr;
    float near = exp(-(d * d) / (R * R)) * uNear;
    vec2 shift = d > 0.0 ? away / d * near * 5.0 * uDpr : vec2(0.0);

    float r = (0.75 + 0.4 * crest + 1.1 * near) * uDpr;
    float dist = length(p - centre - shift);
    float dot = 1.0 - smoothstep(r - 0.5 * uDpr, r + 0.5 * uDpr, dist);
    float alpha = dot * (0.035 + 0.13 * crest + 0.34 * near);

    vec4 colour = linearToOutputTexel(vec4(mix(uDot, uAccent, near * 0.9), 1.0));
    // The canvas is premultiplied, and this pass is drawn straight onto a
    // cleared buffer, so it writes premultiplied colour with no blending.
    gl_FragColor = vec4(colour.rgb * alpha, alpha);
  }
`;

/**
 * The page background: dot-grid notebook paper, drawn as one full-screen pass
 * at the start of every frame, before any figure. Fixed to the viewport —
 * content scrolls over it, so it never lags behind the page.
 */
export default function Backdrop() {
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);

  const pass = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      vertexShader: 'void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: fragment,
      uniforms: {
        ...backdrop,
        uRes: { value: new THREE.Vector2() },
        uPointer: { value: new THREE.Vector2(-1e4, -1e4) },
        uNear: { value: 0 },
        uTime: { value: 0 },
        uDpr: { value: 1 },
      },
      blending: THREE.NoBlending,
      depthTest: false,
      depthWrite: false,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    quad.frustumCulled = false;
    const scene = new THREE.Scene();
    scene.add(quad);
    return { scene, camera: new THREE.Camera(), material };
  }, []);

  const res = useMemo(() => new THREE.Vector2(), []);

  // Priority 1 runs before the figures (drawn at priority 2).
  useFrame((state, delta) => {
    const u = pass.material.uniforms;
    const dpr = gl.getPixelRatio();
    gl.getDrawingBufferSize(res);
    u.uRes.value.copy(res);
    u.uDpr.value = dpr;
    if (!reducedMotion()) u.uTime.value += Math.min(delta, 1 / 20);
    const active = pointer.fine && pointer.inside;
    if (active) u.uPointer.value.set(pointer.x * dpr, pointer.y * dpr);
    u.uNear.value += ((active ? 1 : 0) - u.uNear.value) * (1 - Math.exp(-delta * 6));

    gl.setScissorTest(false);
    gl.setViewport(0, 0, size.width, size.height);
    gl.autoClear = true;
    gl.render(pass.scene, pass.camera);
  }, 1);

  return null;
}
