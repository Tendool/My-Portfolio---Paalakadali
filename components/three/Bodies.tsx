'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { flight, damp } from '@/lib/flight';
import type { BodySpec, BodyKind } from '@/lib/stations';

/** Must match the `uKind` branches in SURFACE_FRAG. */
const KIND_INDEX: Record<BodyKind, number> = { rock: 0, terran: 1, gas: 2, ice: 3 };

/* ==========================================================================
   PLANETARY BODIES

   One shader drives every planet. Surface character comes from two knobs —
   `bands` (latitude banding, 0 for airless rock up to 4+ for a gas giant) and
   `grain` (crater and mottle noise) — so Mercury and Jupiter are the same
   draw call with different uniforms. Nothing is textured, so there is nothing
   to download and the detail holds at any distance.
   ========================================================================== */

const SURFACE_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPos;
  varying vec3 vView;
  varying vec3 vTangent;
  varying vec3 vBitangent;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPos = position;

    // A tangent frame for the sphere, carried into view space so the fragment
    // stage can tilt the normal by a height gradient. Built here because
    // normalMatrix is only available to the vertex shader.
    vec3 up = abs(normal.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
    vec3 t = normalize(cross(up, normal));
    vTangent = normalize(normalMatrix * t);
    vBitangent = normalize(normalMatrix * cross(normal, t));

    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const NOISE = /* glsl */ `
  // Hash-based value noise — no texture lookup, no sin() precision cliffs.
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.07;
      a *= 0.5;
    }
    return v;
  }
`;

const SURFACE_FRAG = /* glsl */ `
  uniform vec3 uLight;
  uniform vec3 uAccent;
  uniform vec3 uColor;
  uniform vec3 uHighlight;
  uniform float uBands;
  uniform float uGrain;
  uniform float uCaps;
  uniform int uKind;      // 0 rock, 1 terran, 2 gas, 3 ice
  uniform float uTime;

  uniform float uSpot;

  varying vec3 vNormal;
  varying vec3 vPos;
  varying vec3 vView;
  varying vec3 vTangent;
  varying vec3 vBitangent;

  ${NOISE}

  // Ridged noise: sharp crests instead of soft blobs. Craters and continental
  // coastlines both want the ridge, not the hill.
  float ridge(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * (1.0 - abs(noise(p) * 2.0 - 1.0));
      p *= 2.11;
      a *= 0.5;
    }
    return v;
  }

  /**
   * Surface relief. The same field the colour is built from, so highlands read
   * light *and* catch the light — which is what sells a terminator.
   */
  float heightAt(vec3 p) {
    if (uKind == 0) return ridge(p * 7.0) * 0.75 + fbm(p * 18.0) * 0.25;
    if (uKind == 1) return fbm(p * 2.6 + vec3(11.0)) * 0.65 + ridge(p * 4.2) * 0.35;
    if (uKind == 2) return fbm(p * 2.4 + vec3(uTime * 0.014, 0.0, 0.0));
    return fbm(p * 2.4) * 0.6;
  }

  void main() {
    vec3 unit = normalize(vPos);
    float lat = abs(unit.y);
    vec3 base;
    float gloss = 0.0;

    // ---- tilt the normal by the height gradient -------------------------
    // Sampling the field along two tangent directions gives a slope; tilting
    // the shading normal against it makes relief catch the light instead of
    // being a flat colour pattern painted on a ball.
    vec3 up = abs(unit.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
    vec3 tObj = normalize(cross(up, unit));
    vec3 bObj = cross(unit, tObj);
    float e = 0.022;
    float h0 = heightAt(unit);
    float hT = heightAt(normalize(unit + tObj * e));
    float hB = heightAt(normalize(unit + bObj * e));
    float bump = uKind == 0 ? 1.5 : uKind == 1 ? 0.9 : 0.35;
    vec3 shading = normalize(
      vNormal - (vTangent * (hT - h0) + vBitangent * (hB - h0)) * (bump / e) * 0.012
    );

    if (uKind == 0) {
      // ---- airless rock: overlapping crater basins with bright rims -------
      float basins = ridge(unit * 7.0);
      float fine = fbm(unit * 18.0);
      float rim = smoothstep(0.62, 0.78, basins);
      base = mix(uColor, uHighlight, basins * 0.7 + fine * 0.3);
      base += uHighlight * rim * 0.22;
    } else if (uKind == 1) {
      // ---- terran: continents above a sea-level threshold -----------------
      float land = fbm(unit * 2.6 + vec3(11.0)) * 0.65 + ridge(unit * 4.2) * 0.35;
      float sea = smoothstep(0.46, 0.5, land);
      vec3 ocean = uColor * 0.62;
      vec3 ground = mix(uHighlight * 0.55, uHighlight, fbm(unit * 9.0));
      base = mix(ocean, ground, sea);
      // Water is the only place a specular highlight belongs.
      gloss = (1.0 - sea) * 0.5;
      // Cloud deck, drifting independently of the surface below it.
      float clouds = smoothstep(0.52, 0.72, fbm(unit * 3.4 + vec3(uTime * 0.012, 0.0, 0.0)));
      base = mix(base, vec3(0.93, 0.95, 0.98), clouds * 0.45);
    } else if (uKind == 2) {
      // ---- gas giant: bands warped by their own flow (domain warping) -----
      vec3 q = vec3(fbm(unit * 1.6), fbm(unit * 1.6 + vec3(5.2)), fbm(unit * 1.6 + vec3(9.1)));
      float flow = fbm(unit * 2.2 + q * 1.9 + vec3(uTime * 0.014, 0.0, 0.0));
      float belts = sin(unit.y * uBands * 3.2 + flow * 5.5) * 0.5 + 0.5;
      belts = smoothstep(0.24, 0.76, belts);
      base = mix(uColor, uHighlight, belts);
      // Zonal turbulence: thin shear lines where adjacent belts meet.
      float shear = abs(sin(unit.y * uBands * 6.4 + flow * 7.0));
      base = mix(base, base * 1.22, pow(shear, 6.0) * 0.5);

      // A single anticyclonic oval, stretched along the bands. Jupiter without
      // its storm reads as a generic striped ball.
      if (uSpot > 0.0) {
        vec2 d = vec2((atan(unit.z, unit.x) + 2.1) * 0.5, (unit.y + 0.28) * 1.9);
        d.x = mod(d.x + 3.14159, 6.28318) - 3.14159;
        float oval = 1.0 - smoothstep(0.0, 0.5, length(d * vec2(1.0, 2.4)));
        float swirl = fbm(unit * 7.0 + flow) * 0.4 + 0.8;
        base = mix(base, vec3(0.78, 0.58, 0.46) * swirl, oval * uSpot);
      }
    } else {
      // ---- ice giant: near-featureless, faint banding, high albedo --------
      float haze = fbm(unit * 2.4 + vec3(uTime * 0.008, 0.0, 0.0));
      float belts = sin(unit.y * uBands * 2.4 + haze * 2.0) * 0.5 + 0.5;
      base = mix(uColor, uHighlight, smoothstep(0.35, 0.68, belts) * 0.55 + haze * 0.2);
      gloss = 0.18;
    }

    base = mix(base, base * (0.78 + fbm(unit * 5.5) * 0.6), uGrain * 0.6);

    // Polar caps, with a ragged noise edge rather than a drawn circle.
    if (uCaps > 0.0) {
      float edge = uCaps - fbm(unit * 6.0) * 0.09;
      float cap = smoothstep(edge - 0.05, edge + 0.02, lat);
      base = mix(base, vec3(0.94, 0.95, 0.97), cap * 0.9);
    }

    float diffuse = max(0.0, dot(shading, normalize(uLight)));
    // Wrapped lighting: a hard terminator looks like a CG sphere, a soft one
    // looks photographed.
    float wrapped = diffuse * 0.82 + 0.2;

    // Blinn-Phong specular, only where the body has something reflective.
    if (gloss > 0.0) {
      vec3 h = normalize(normalize(uLight) + vView);
      float spec = pow(max(dot(shading, h), 0.0), 48.0) * gloss;
      base += vec3(0.9, 0.93, 1.0) * spec;
    }

    // Limb darkening — atmospheres are optically thicker at a glancing angle.
    float limb = pow(max(dot(vNormal, vView), 0.0), 0.42);
    vec3 lit = base * wrapped * mix(0.7, 1.0, limb);

    // Forward scattering: on a body with air, the crescent just inside the
    // terminator is brighter than flat diffuse predicts.
    if (uKind != 0) {
      float graze = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.0);
      lit += uHighlight * graze * diffuse * 0.28;
    }

    // Fresnel rim, brightest where the lit limb meets the terminator. The only
    // place the accent touches a planet, which is what keeps the palette.
    float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 3.0);
    lit += uAccent * fres * (0.05 + diffuse * 0.4);

    gl_FragColor = vec4(lit, 1.0);
  }
`;

const ATMO_FRAG = /* glsl */ `
  uniform vec3 uAccent;
  uniform vec3 uHighlight;
  uniform vec3 uLight;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    // This shell renders BackSide, so the interpolated attribute normal still
    // points outward — away from the camera — and the Fresnel would saturate
    // to 1 across the whole disc, drawing a flat plate instead of a rim.
    // Flipping it puts the falloff back where it belongs.
    vec3 n = normalize(-vNormal);
    float fres = pow(1.0 - max(dot(n, vView), 0.0), 3.4);
    float lit = max(0.0, dot(n, normalize(uLight))) * 0.85 + 0.15;
    float a = fres * lit * 0.5;
    if (a < 0.003) discard;
    gl_FragColor = vec4(mix(uHighlight, uAccent, 0.18) * a, a);
  }
`;

const RING_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const RING_FRAG = /* glsl */ `
  uniform vec3 uColor;
  varying vec2 vUv;

  float hash(float n) { return fract(sin(n) * 43758.5453); }

  void main() {
    // vUv.x runs across the band width once the geometry's UVs are remapped.
    float r = vUv.x;
    float grains = hash(floor(r * 46.0)) * 0.62 + 0.38;
    // A Cassini-style division about a third of the way out.
    float gap = smoothstep(0.03, 0.09, abs(r - 0.36)) * 0.55 + 0.45;
    float edge = smoothstep(0.0, 0.06, r) * (1.0 - smoothstep(0.88, 1.0, r));
    float a = grains * gap * edge * 0.6;
    if (a < 0.004) discard;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

/** Light comes from the Sun's side of the corridor for every body. */
const LIGHT_DIR = new THREE.Vector3(-0.62, 0.5, 0.6).normalize();

function Moon({
  radius,
  distance,
  speed,
  tilt,
  segments,
  reduced,
}: {
  radius: number;
  distance: number;
  speed: number;
  tilt: number;
  segments: number;
  reduced: boolean;
}) {
  const orbit = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (orbit.current && !reduced) orbit.current.rotation.y += delta * speed;
  });

  return (
    <group rotation={[tilt, 0, tilt * 0.5]}>
      <group ref={orbit}>
        <mesh position={[distance, 0, 0]}>
          <sphereGeometry
            args={[radius, Math.max(14, Math.round(segments / 3)), Math.max(10, Math.round(segments / 4))]}
          />
          <meshStandardMaterial color="#9aa0ac" roughness={0.95} metalness={0.04} />
        </mesh>
      </group>
    </group>
  );
}

function Rings({ spec, accent }: { spec: BodySpec; accent: string }) {
  const [inner, outer, tilt] = spec.rings!;

  // A ring geometry's default UVs are radial; remap u to "fraction across the
  // band" so the shader can draw concentric divisions.
  const geometry = useMemo(() => {
    const g = new THREE.RingGeometry(inner, outer, 128, 1);
    const pos = g.attributes.position;
    const uv = g.attributes.uv;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i += 1) {
      v.fromBufferAttribute(pos, i);
      uv.setXY(i, (v.length() - inner) / (outer - inner), 0.5);
    }
    uv.needsUpdate = true;
    return g;
  }, [inner, outer]);

  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color(spec.highlight).lerp(new THREE.Color(accent), 0.1) } }),
    [spec.highlight, accent],
  );

  return (
    <mesh geometry={geometry} rotation={[Math.PI / 2 - tilt, 0, 0.18]}>
      <shaderMaterial
        vertexShader={RING_VERT}
        fragmentShader={RING_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export function Body({
  spec,
  segments,
  reduced,
  accent,
}: {
  spec: BodySpec;
  segments: number;
  reduced: boolean;
  accent: string;
}) {
  const bodyRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const tiltRef = useRef<THREE.Group>(null);

  const uniforms = useMemo(
    () => ({
      uLight: { value: LIGHT_DIR.clone() },
      uAccent: { value: new THREE.Color(accent) },
      uColor: { value: new THREE.Color(spec.color) },
      uHighlight: { value: new THREE.Color(spec.highlight) },
      uBands: { value: spec.bands },
      uGrain: { value: spec.grain },
      uCaps: { value: spec.caps ?? 0 },
      uSpot: { value: spec.spot ?? 0 },
      uKind: { value: KIND_INDEX[spec.kind] },
      uTime: { value: 0 },
    }),
    [spec, accent],
  );

  const atmoUniforms = useMemo(
    () => ({
      uAccent: { value: new THREE.Color(accent) },
      uHighlight: { value: new THREE.Color(spec.highlight) },
      uLight: { value: LIGHT_DIR.clone() },
    }),
    [spec.highlight, accent],
  );

  useFrame(({ clock }, delta) => {
    const d = Math.min(delta, 0.05);
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.elapsedTime;
    if (bodyRef.current && !reduced) bodyRef.current.rotation.y += d * 0.06;
    // Each body leans toward the pointer, so it reads as a thing in space
    // rather than a decal on the background.
    if (tiltRef.current && !reduced) {
      tiltRef.current.rotation.x = damp(tiltRef.current.rotation.x, -flight.pointerY * 0.14, 0.01, d);
      tiltRef.current.rotation.z = damp(tiltRef.current.rotation.z, flight.pointerX * 0.1, 0.01, d);
    }
  });

  const seg = Math.max(24, segments);

  return (
    <group ref={tiltRef}>
      <group rotation={[0, 0, spec.tilt ?? 0]}>
        <mesh ref={bodyRef}>
          <sphereGeometry args={[spec.radius, seg, Math.round(seg / 2)]} />
          <shaderMaterial
            ref={matRef}
            vertexShader={SURFACE_VERT}
            fragmentShader={SURFACE_FRAG}
            uniforms={uniforms}
          />
        </mesh>

        {/* Atmosphere shell, rendered inside-out so the rim wraps the limb. */}
        <mesh scale={1.055}>
          <sphereGeometry args={[spec.radius, Math.round(seg / 2), Math.round(seg / 3)]} />
          <shaderMaterial
            vertexShader={SURFACE_VERT}
            fragmentShader={ATMO_FRAG}
            uniforms={atmoUniforms}
            transparent
            depthWrite={false}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {spec.rings && <Rings spec={spec} accent={accent} />}
      </group>

      {spec.moons?.map((m, i) => (
        <Moon
          key={i}
          radius={m[0]}
          distance={m[1]}
          speed={m[2]}
          tilt={m[3]}
          segments={seg}
          reduced={reduced}
        />
      ))}

      <directionalLight position={LIGHT_DIR.toArray()} intensity={3.4} />
    </group>
  );
}

/* ==========================================================================
   THE SUN
   Emissive, so it is lit by nothing and lights nothing — the planets all use
   a matching fixed light direction instead, which is far cheaper than a real
   point light reaching across 400 units of corridor.
   ========================================================================== */

const SUN_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uAccent;
  varying vec3 vNormal;
  varying vec3 vPos;
  varying vec3 vView;

  ${NOISE}

  float ridge(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * (1.0 - abs(noise(p) * 2.0 - 1.0));
      p *= 2.11;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 unit = normalize(vPos);

    // Granulation: convection cells, with the bright cell interiors separated
    // by darker intergranular lanes. Ridged noise gives the lanes.
    float cells = ridge(unit * 13.0 + vec3(uTime * 0.05, uTime * 0.03, 0.0));
    float fine = fbm(unit * 30.0 - vec3(0.0, uTime * 0.09, 0.0));
    float lanes = smoothstep(0.28, 0.86, cells);

    // Supergranulation — a slower, much larger cell pattern underneath.
    float superg = fbm(unit * 1.8 + vec3(uTime * 0.01, 0.0, 0.0));

    float heat = lanes * 0.62 + fine * 0.2 + superg * 0.18;

    vec3 deep = vec3(0.90, 0.82, 0.72);
    vec3 mid = vec3(1.0, 0.97, 0.91);
    vec3 peak = vec3(1.0, 1.0, 1.0);
    vec3 base = mix(deep, mid, smoothstep(0.2, 0.55, heat));
    base = mix(base, peak, smoothstep(0.62, 0.9, heat));

    // Limb darkening is the single most recognisable thing about a real star:
    // the disc is markedly cooler and redder at the edge than at the centre.
    float mu = max(dot(vNormal, vView), 0.0);
    float limb = 0.5 + 0.5 * pow(mu, 0.55);
    base *= limb;
    base = mix(base, base * uAccent * 1.5 + uAccent * 0.12, pow(1.0 - mu, 1.6) * 0.6);

    gl_FragColor = vec4(base, 1.0);
  }
`;

const CORONA_FRAG = /* glsl */ `
  uniform vec3 uAccent;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    // BackSide shell — see the note in ATMO_FRAG; the normal has to be flipped
    // or the corona fills as a hard-edged disc.
    vec3 n = normalize(-vNormal);
    float rim = 1.0 - max(dot(n, vView), 0.0);
    // Two falloffs stacked: a tight hot ring right at the photosphere, and a
    // wide soft halo reaching out past it.
    float tight = pow(rim, 3.0);
    float wide = pow(rim, 1.6);
    float pulse = 0.88 + sin(uTime * 0.6) * 0.12;
    float a = (tight * 0.4 + wide * 0.36) * pulse;
    if (a < 0.003) discard;
    vec3 col = mix(vec3(1.0, 0.95, 0.86), uAccent, smoothstep(0.2, 0.85, rim));
    gl_FragColor = vec4(col * a, a);
  }
`;

export function Sun({
  segments,
  reduced,
  accent,
}: {
  segments: number;
  reduced: boolean;
  accent: string;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const coronaRef = useRef<THREE.ShaderMaterial>(null);
  const bodyRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uAccent: { value: new THREE.Color(accent) } }),
    [accent],
  );
  const coronaUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uAccent: { value: new THREE.Color(accent) } }),
    [accent],
  );

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    if (matRef.current) matRef.current.uniforms.uTime.value = t;
    if (coronaRef.current) coronaRef.current.uniforms.uTime.value = t;
    if (bodyRef.current && !reduced) bodyRef.current.rotation.y += Math.min(delta, 0.05) * 0.03;
  });

  const seg = Math.max(32, segments);

  return (
    <group>
      <mesh ref={bodyRef}>
        <sphereGeometry args={[4.6, seg, Math.round(seg / 2)]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={SURFACE_VERT}
          fragmentShader={SUN_FRAG}
          uniforms={uniforms}
          // Fog would grey out the one object that must read as pure light.
          fog={false}
        />
      </mesh>

      <mesh scale={1.35}>
        <sphereGeometry args={[4.6, Math.round(seg / 2), Math.round(seg / 3)]} />
        <shaderMaterial
          ref={coronaRef}
          vertexShader={SURFACE_VERT}
          fragmentShader={CORONA_FRAG}
          uniforms={coronaUniforms}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </mesh>
    </group>
  );
}
