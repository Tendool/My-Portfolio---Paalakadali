'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { flight, damp, clamp } from '@/lib/flight';

/* ==========================================================================
   SPIRAL GALAXY

   The disc lies in the XY plane at world origin, so at the top of the page it
   reads face-on and screen-horizontal is simply world X.

   Particles are placed once on the CPU. Everything that moves per frame — the
   scroll split, the cursor repulsion, point sizing — happens in the vertex
   shader, so a 27k-star galaxy costs almost nothing on the JS side.

   Rotation lives on the parent groups rather than inside the shader. That
   keeps the shader's coordinate space identical to the geometry's, which is
   what lets the cursor be resolved into it exactly.
   ========================================================================== */

export const GALAXY_RADIUS = 12;
const ARMS = 2;
/** Turns each arm completes between the bulge and the rim. */
const WINDING = 2.55;
/** Knots of star formation strung along the arms. */
const CLUSTERS = 120;

const COMMON = /* glsl */ `
  uniform float uSize;
  uniform float uSplit;
  uniform float uPixelRatio;
  uniform vec2 uMouse;
  uniform float uMouseStrength;
  uniform float uTanHalfFov;
  uniform float uAspect;

  attribute float aScale;
  attribute float aAlpha;
  attribute float aSide;
  attribute float aSpread;

  // Shoulders a star aside when the cursor is close, easing back to nothing as
  // it leaves. The displacement is a pure function of the current cursor
  // position, so every star returns to exactly where it started — there is no
  // per-particle state to drift out of sync.
  vec2 repel(vec2 p) {
    vec2 away = p - uMouse;
    float d = length(away);
    float influence = 1.0 - smoothstep(0.0, 3.1, d);
    influence *= influence;
    // Each star shoves a little differently, so the field scatters instead of
    // inflating like one rubber sheet.
    float personal = 0.5 + aSpread * 1.0;
    return normalize(away + vec2(0.0001)) * influence * uMouseStrength * personal;
  }

  // How far a star slides when the curtain opens, as a fraction of the screen's
  // half-width *at that star's own depth*. Working in screen terms rather than
  // world units keeps the parted gap identical whatever the camera distance,
  // field of view or viewport aspect happens to be.
  float splitOffset(float viewZ, float spread) {
    float halfWidth = -viewZ * uTanHalfFov * uAspect;
    return halfWidth * (0.62 + spread * 0.75);
  }
`;

const STAR_VERT = /* glsl */ `
  ${COMMON}

  attribute float aTint;
  varying float vAlpha;
  varying float vTint;

  void main() {
    vec3 pos = position;
    pos.xy += repel(pos.xy);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    mv.x += aSide * uSplit * splitOffset(mv.z, aSpread);

    gl_Position = projectionMatrix * mv;

    float size = uSize * aScale * uPixelRatio / max(0.001, -mv.z);
    // Clamped: a handful of near, oversized sprites can otherwise eat the
    // entire fill rate on an integrated GPU.
    gl_PointSize = clamp(size, 1.0, 60.0);

    vAlpha = aAlpha * mix(1.0, 0.62, uSplit);
    vTint = aTint;
  }
`;

const STAR_FRAG = /* glsl */ `
  varying float vAlpha;
  varying float vTint;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5)) * 2.0;
    if (d > 1.0) discard;

    // A tight bright centre inside a wide soft halo — the bokeh of a long
    // exposure, rather than a flat disc.
    float halo = pow(1.0 - d, 2.3) * 0.46;
    float core = pow(max(0.0, 1.0 - d * 1.85), 7.0);
    float a = clamp(halo + core, 0.0, 1.0) * vAlpha;
    if (a < 0.004) discard;

    // Mostly white, threaded with cool blue-white giants and warm older stars.
    vec3 cool = vec3(0.80, 0.87, 1.00);
    vec3 warm = vec3(1.00, 0.72, 0.44);
    vec3 col = vTint < 0.0 ? mix(vec3(1.0), cool, -vTint) : mix(vec3(1.0), warm, vTint);

    gl_FragColor = vec4(col * a, a);
  }
`;

/** Soft grey ribbons sitting under the arms, giving them body. */
const HAZE_VERT = /* glsl */ `
  ${COMMON}
  varying float vAlpha;

  void main() {
    vec3 pos = position;
    // The haze is a cloud, not a star: it yields to the cursor less readily.
    pos.xy += repel(pos.xy) * 0.42;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    mv.x += aSide * uSplit * splitOffset(mv.z, aSpread);

    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(uSize * aScale * uPixelRatio / max(0.001, -mv.z), 2.0, 220.0);
    vAlpha = aAlpha * mix(1.0, 0.5, uSplit);
  }
`;

const HAZE_FRAG = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5)) * 2.0;
    if (d > 1.0) discard;
    float a = pow(1.0 - d, 2.7) * vAlpha;
    if (a < 0.002) discard;
    gl_FragColor = vec4(vec3(0.74, 0.78, 0.86) * a, a);
  }
`;

/* -------------------------------------------------------------------------- */

// Box-Muller. Arms need a gaussian falloff, not a uniform band, or they read
// as hard-edged ribbons instead of star clouds.
function gaussian() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function armPoint(arm: number, r: number) {
  const theta = (arm / ARMS) * Math.PI * 2 + (r / GALAXY_RADIUS) * WINDING * Math.PI * 2;
  return { x: Math.cos(theta) * r, y: Math.sin(theta) * r };
}

type Knot = { x: number; y: number; r: number };

function makeKnots(): Knot[] {
  return Array.from({ length: CLUSTERS }, () => {
    const r = 1.4 + Math.pow(Math.random(), 0.8) * (GALAXY_RADIUS - 1.6);
    const p = armPoint(Math.floor(Math.random() * ARMS), r);
    const jitter = 0.06 + (r / GALAXY_RADIUS) * 0.34;
    return {
      x: p.x + gaussian() * jitter,
      y: p.y + gaussian() * jitter,
      r: 0.16 + r * 0.042,
    };
  });
}

function buildStars(count: number, knots: Knot[]) {
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const alphas = new Float32Array(count);
  const sides = new Float32Array(count);
  const spreads = new Float32Array(count);
  const tints = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    const roll = Math.random();
    let x: number;
    let y: number;

    if (roll < 0.12) {
      // Bulge — the dense, near-spherical nucleus.
      const r = Math.pow(Math.random(), 2.8) * 1.7;
      const a = Math.random() * Math.PI * 2;
      x = Math.cos(a) * r;
      y = Math.sin(a) * r;
    } else if (roll < 0.17) {
      // Halo — a thin scatter of field stars across and beyond the disc.
      const r = Math.sqrt(Math.random()) * GALAXY_RADIUS * 1.2;
      const a = Math.random() * Math.PI * 2;
      x = Math.cos(a) * r;
      y = Math.sin(a) * r;
    } else if (roll < 0.58) {
      // Cluster stars — tight knots riding the arms. This clumping is most of
      // what makes the spiral legible at a glance.
      const k = knots[(Math.random() * knots.length) | 0];
      x = k.x + gaussian() * k.r;
      y = k.y + gaussian() * k.r;
    } else {
      // Arm dust — the fine ribbon the knots are strung along. Kept narrow so
      // the lanes between the arms stay genuinely dark.
      const t = Math.pow(Math.random(), 0.72);
      const r = 1.0 + t * (GALAXY_RADIUS - 1.0);
      const p = armPoint(i % ARMS, r);
      const width = 0.09 + t * 0.52;
      x = p.x + gaussian() * width;
      y = p.y + gaussian() * width;
    }

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = gaussian() * 0.3;

    // Squared rather than cubed: the field is carried by plenty of chunky
    // bokeh orbs, not a haze of pinpricks with three big ones.
    const rare = Math.pow(Math.random(), 2.2);
    scales[i] = 0.3 + rare * 7.0;
    alphas[i] = 0.24 + Math.pow(Math.random(), 1.7) * 0.76;

    // ~20% cool giants, ~18% warm older stars, the rest white.
    const c = Math.random();
    tints[i] = c < 0.2 ? -(0.4 + Math.random() * 0.6) : c < 0.38 ? 0.45 + Math.random() * 0.55 : 0;

    sides[i] = x >= 0 ? 1 : -1;
    spreads[i] = Math.random();
  }

  return { positions, scales, alphas, sides, spreads, tints };
}

function buildHaze(count: number, knots: Knot[]) {
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const alphas = new Float32Array(count);
  const sides = new Float32Array(count);
  const spreads = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    const k = knots[(Math.random() * knots.length) | 0];
    const x = k.x + gaussian() * k.r * 1.5;
    const y = k.y + gaussian() * k.r * 1.5;

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = -0.4;

    scales[i] = 9 + Math.random() * 16;
    alphas[i] = 0.035 + Math.random() * 0.05;
    sides[i] = x >= 0 ? 1 : -1;
    spreads[i] = Math.random();
  }

  return { positions, scales, alphas, sides, spreads };
}

function makeUniforms() {
  return {
    uSize: { value: 265 },
    uSplit: { value: 0 },
    uPixelRatio: { value: 1 },
    uMouse: { value: new THREE.Vector2(9999, 9999) },
    uMouseStrength: { value: 0 },
    uTanHalfFov: { value: 0.466 },
    uAspect: { value: 1.6 },
  };
}

/* -------------------------------------------------------------------------- */

export default function Galaxy({ count, reduced }: { count: number; reduced: boolean }) {
  const starMat = useRef<THREE.ShaderMaterial>(null);
  const hazeMat = useRef<THREE.ShaderMaterial>(null);
  const tiltRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const { gl, camera } = useThree();

  const knots = useMemo(() => makeKnots(), []);
  const stars = useMemo(() => buildStars(count, knots), [count, knots]);
  const haze = useMemo(() => buildHaze(Math.round(count * 0.035), knots), [count, knots]);

  const starUniforms = useMemo(makeUniforms, []);
  const hazeUniforms = useMemo(makeUniforms, []);

  // Scratch objects, reused every frame so the hot path allocates nothing.
  const scratch = useMemo(
    () => ({
      ray: new THREE.Raycaster(),
      ndc: new THREE.Vector2(),
      plane: new THREE.Plane(),
      hit: new THREE.Vector3(),
      normal: new THREE.Vector3(),
      origin: new THREE.Vector3(),
      quat: new THREE.Quaternion(),
      local: new THREE.Vector2(),
    }),
    [],
  );

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05);
    const tilt = tiltRef.current;
    const spin = spinRef.current;
    const sm = starMat.current;
    const hm = hazeMat.current;
    if (!sm || !hm || !tilt || !spin) return;

    const cam = camera as THREE.PerspectiveCamera;
    const pr = gl.getPixelRatio();
    const tanHalfFov = Math.tan((cam.fov * Math.PI) / 360);

    // The curtain opens over the first stretch of scrolling and stays open, so
    // the rest of the page reads against clear space. Scrolling back to the top
    // runs the same damping in reverse and the disc reassembles.
    const target = reduced ? 0 : clamp((flight.scroll - 0.015) / 0.09, 0, 1);
    const eased = target * target * (3 - 2 * target);
    const split = damp(sm.uniforms.uSplit.value, eased, 0.0012, d);

    for (const m of [sm, hm]) {
      m.uniforms.uPixelRatio.value = pr;
      m.uniforms.uSplit.value = split;
      m.uniforms.uTanHalfFov.value = tanHalfFov;
      m.uniforms.uAspect.value = cam.aspect;
    }

    if (reduced) return;

    spin.rotation.z += d * 0.045;

    // Coast after the pointer lifts, then settle into a slow idle drift.
    if (!flight.dragging) {
      flight.spinVelocity *= Math.pow(0.94, d * 60);
      flight.dragYaw += flight.spinVelocity;
    }

    tilt.rotation.z = flight.dragYaw + flight.pointerX * 0.1;
    tilt.rotation.x = damp(
      tilt.rotation.x,
      -0.3 + flight.dragPitch - flight.pointerY * 0.12,
      0.004,
      d,
    );

    // ---- resolve the cursor into the disc's own coordinate space ----------
    // Cast a ray through the pointer, intersect the plane the disc lies in,
    // then pull that world point back into local space. Doing it properly keeps
    // the repulsion anchored to the stars however the disc is turned.
    const { ray, ndc, plane, hit, normal, origin, quat, local } = scratch;
    ndc.set(flight.pointerX, flight.pointerY);
    ray.setFromCamera(ndc, cam);
    normal.set(0, 0, 1).applyQuaternion(spin.getWorldQuaternion(quat));
    spin.getWorldPosition(origin);
    plane.setFromNormalAndCoplanarPoint(normal, origin);

    let strength = 0;
    if (ray.ray.intersectPlane(plane, hit)) {
      spin.worldToLocal(hit);
      local.set(hit.x, hit.y);
      // Only push while the cursor is over the disc, and back off as the galaxy
      // parts so the split reads cleanly.
      strength = local.length() < GALAXY_RADIUS * 1.3 ? 1.2 * (1 - split) : 0;
    }

    sm.uniforms.uMouse.value.lerp(local, 1 - Math.pow(0.0002, d));
    hm.uniforms.uMouse.value.copy(sm.uniforms.uMouse.value);
    sm.uniforms.uMouseStrength.value = damp(sm.uniforms.uMouseStrength.value, strength, 0.002, d);
    hm.uniforms.uMouseStrength.value = sm.uniforms.uMouseStrength.value;
  });

  return (
    <group ref={tiltRef}>
      <group ref={spinRef}>
        <points frustumCulled={false}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[haze.positions, 3]} />
            <bufferAttribute attach="attributes-aScale" args={[haze.scales, 1]} />
            <bufferAttribute attach="attributes-aAlpha" args={[haze.alphas, 1]} />
            <bufferAttribute attach="attributes-aSide" args={[haze.sides, 1]} />
            <bufferAttribute attach="attributes-aSpread" args={[haze.spreads, 1]} />
          </bufferGeometry>
          <shaderMaterial
            ref={hazeMat}
            vertexShader={HAZE_VERT}
            fragmentShader={HAZE_FRAG}
            uniforms={hazeUniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>

        <points frustumCulled={false}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[stars.positions, 3]} />
            <bufferAttribute attach="attributes-aScale" args={[stars.scales, 1]} />
            <bufferAttribute attach="attributes-aAlpha" args={[stars.alphas, 1]} />
            <bufferAttribute attach="attributes-aSide" args={[stars.sides, 1]} />
            <bufferAttribute attach="attributes-aSpread" args={[stars.spreads, 1]} />
            <bufferAttribute attach="attributes-aTint" args={[stars.tints, 1]} />
          </bufferGeometry>
          <shaderMaterial
            ref={starMat}
            vertexShader={STAR_VERT}
            fragmentShader={STAR_FRAG}
            uniforms={starUniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
    </group>
  );
}
