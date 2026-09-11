'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { flight, damp } from '@/lib/flight';

/* ==========================================================================
   The hand-built stations the camera passes on its way down the page. All
   procedural: primitives assembled in code, no model files to fetch.
   ========================================================================== */

/* ------------------------------------------------------------------ BELT --
   A ring of rocks the camera flies straight through. One InstancedMesh draws
   the whole belt, and the per-instance matrices are only rewritten when the
   cursor is close enough to actually shove them — so a still pointer costs
   nothing beyond a single draw call.
   -------------------------------------------------------------------------- */

export function AsteroidBelt({
  count,
  reduced,
}: {
  count: number;
  reduced: boolean;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const rocks = useMemo(
    () =>
      Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const radius = 11 + Math.random() * 22;
        return {
          home: new THREE.Vector3(
            Math.cos(angle) * radius,
            (Math.random() - 0.5) * 14,
            Math.sin(angle) * radius * 0.55 + (Math.random() - 0.5) * 26,
          ),
          rotation: new THREE.Euler(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI,
          ),
          spin: (Math.random() - 0.5) * 0.5,
          // Power-law sizes: a belt is overwhelmingly small rubble with a few
          // large bodies, not an even spread.
          scale: 0.1 + Math.pow(Math.random(), 3.2) * 0.95,
          // Rocks are not spheres. Independent axis ratios turn one shared
          // geometry into elongated, flattened and blocky fragments.
          stretch: new THREE.Vector3(
            0.62 + Math.random() * 0.8,
            0.62 + Math.random() * 0.8,
            0.62 + Math.random() * 0.8,
          ),
          // Albedo spread, so the field is not one flat grey.
          shade: 0.45 + Math.random() * 0.75,
        };
      }),
    [count],
  );

  const scratch = useMemo(
    () => ({
      matrix: new THREE.Matrix4(),
      quat: new THREE.Quaternion(),
      pos: new THREE.Vector3(),
      scale: new THREE.Vector3(),
      colour: new THREE.Color(),
      away: new THREE.Vector3(),
      ray: new THREE.Raycaster(),
      ndc: new THREE.Vector2(),
      plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
      hit: new THREE.Vector3(),
      cursor: new THREE.Vector3(9999, 9999, 9999),
      euler: new THREE.Euler(),
      world: new THREE.Vector3(),
    }),
    [],
  );

  /**
   * One lumpy rock, shared by every instance. Displacing the vertices of a
   * subdivided icosahedron gives irregular facets and a broken silhouette —
   * an undisplaced polyhedron reads as a manufactured shape no matter how it
   * is scaled, which is what gave the old belt away.
   */
  const rockGeometry = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, 1);
    const pos = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i += 1) {
      v.fromBufferAttribute(pos, i);
      // Hash the direction so shared vertices are displaced identically and
      // the mesh stays watertight.
      const n = Math.sin(v.x * 12.9898 + v.y * 78.233 + v.z * 37.719) * 43758.5453;
      const jitter = 0.72 + (n - Math.floor(n)) * 0.56;
      v.multiplyScalar(jitter);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, []);

  const write = (time: number, push: number) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const { matrix, quat, pos, scale, away, cursor, euler } = scratch;

    for (let i = 0; i < rocks.length; i += 1) {
      const r = rocks[i];
      pos.copy(r.home);

      if (push > 0.001) {
        away.copy(pos).sub(cursor);
        const dist = away.length();
        if (dist < 9) {
          const influence = (1 - dist / 9) ** 2;
          away.normalize().multiplyScalar(influence * push * 4.2);
          pos.add(away);
        }
      }

      euler.set(
        r.rotation.x + time * r.spin,
        r.rotation.y + time * r.spin * 0.7,
        r.rotation.z,
      );
      quat.setFromEuler(euler);
      scale.copy(r.stretch).multiplyScalar(r.scale);
      matrix.compose(pos, quat, scale);
      mesh.setMatrixAt(i, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };

  // Seed the matrices once so the belt is correct on the very first frame,
  // including when reduced motion stops the animation loop from writing them.
  useLayoutEffect(() => {
    write(0, 0);
    const mesh = meshRef.current;
    if (!mesh) return;
    const { colour } = scratch;
    for (let i = 0; i < rocks.length; i += 1) {
      colour.setScalar(rocks[i].shade);
      mesh.setColorAt(i, colour);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rocks]);

  useFrame(({ clock, camera }, delta) => {
    if (reduced) return;
    const d = Math.min(delta, 0.05);
    const group = groupRef.current;
    if (group) group.rotation.y += d * 0.02;

    // Project the pointer onto the belt's own plane to get a world-space
    // cursor the rocks can be pushed away from.
    const { ray, ndc, plane, hit, cursor, world } = scratch;
    ndc.set(flight.pointerX, flight.pointerY);
    ray.setFromCamera(ndc, camera);
    group?.getWorldPosition(world);
    plane.constant = -world.z;
    if (ray.ray.intersectPlane(plane, hit)) {
      group?.worldToLocal(hit);
      cursor.lerp(hit, 1 - Math.pow(0.0005, d));
    }

    write(clock.elapsedTime, 1);
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={meshRef}
        args={[rockGeometry, undefined, count]}
        frustumCulled={false}
      >
        <meshStandardMaterial color="#9aa0ab" roughness={1} metalness={0.04} flatShading />
      </instancedMesh>
      <directionalLight position={[-4, 6, 8]} intensity={1.8} />
    </group>
  );
}

/* ------------------------------------------------------------- SATELLITE --
   Body, dish, solar wings and a slow tumble.
   -------------------------------------------------------------------------- */

export function Satellite({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const dish = useRef<THREE.Group>(null);

  useFrame(({ clock }, delta) => {
    if (reduced) return;
    const d = Math.min(delta, 0.05);
    const g = ref.current;
    if (g) {
      g.rotation.y += d * 0.16;
      g.rotation.x = Math.sin(clock.elapsedTime * 0.32) * 0.16;
      g.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.4;
    }
    if (dish.current) dish.current.rotation.z = Math.sin(clock.elapsedTime * 0.4) * 0.34;
  });

  const panel = (
    <>
      <mesh>
        <boxGeometry args={[2.6, 0.05, 1.1]} />
        <meshStandardMaterial color="#1b1f29" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Cell grid, drawn as thin emissive strips rather than a texture. */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[-1.04 + i * 0.52, 0.032, 0]}>
          <boxGeometry args={[0.4, 0.01, 0.95]} />
          <meshStandardMaterial
            color="#2c3140"
            emissive="#3d4657"
            emissiveIntensity={0.5}
            roughness={0.3}
          />
        </mesh>
      ))}
    </>
  );

  return (
    <group ref={ref}>
      <mesh>
        <cylinderGeometry args={[0.55, 0.55, 1.5, 12]} />
        <meshStandardMaterial color="#c8ccd4" roughness={0.45} metalness={0.75} />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.3, 0.55, 0.45, 12]} />
        <meshStandardMaterial color="#8f949e" roughness={0.5} metalness={0.7} />
      </mesh>

      <group ref={dish} position={[0, 0.4, 0.95]} rotation={[0.7, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.85, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2.6]} />
          <meshStandardMaterial color="#e3e6ec" roughness={0.35} metalness={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.75, 6]} />
          <meshStandardMaterial color="#cfd3da" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      <group position={[2.05, 0, 0]}>{panel}</group>
      <group position={[-2.05, 0, 0]}>{panel}</group>

      <mesh position={[0, -1.0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.8, 6]} />
        <meshStandardMaterial color="#9aa0ac" metalness={0.8} roughness={0.3} />
      </mesh>

      <pointLight position={[2, 2, 3]} intensity={12} distance={14} color="#ffffff" />
      <directionalLight position={[-3, 4, 6]} intensity={1.4} />
    </group>
  );
}

/* ==========================================================================
   STAR SHADING

   A sphere lit with `emissive` renders as a flat saturated disc — there is no
   shading to vary across it, so it reads as a circle sticker rather than a
   body. These shaders give the last two constructs real internal structure: a
   hot centre falling off toward a cooler limb, and a halo whose density is
   actually a function of viewing angle.
   ========================================================================== */

const STAR_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const STAR_FRAG = /* glsl */ `
  uniform vec3 uCore;
  uniform vec3 uEdge;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    float mu = max(dot(vNormal, vView), 0.0);
    // Limb darkening — the same cue that makes the Sun read as a sphere.
    vec3 col = mix(uEdge, uCore, pow(mu, 0.45));
    float falloff = 0.45 + 0.55 * pow(mu, 1.5);
    gl_FragColor = vec4(col * falloff * uIntensity, 1.0);
  }
`;

/** Back-side shell. The normal is flipped, or the Fresnel saturates flat. */
const HALO_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uStrength;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vec3 n = normalize(-vNormal);
    float rim = 1.0 - max(dot(n, vView), 0.0);
    // A tight ring against the body plus a wide, much fainter reach.
    float a = (pow(rim, 3.4) * 0.55 + pow(rim, 1.4) * 0.16) * uStrength;
    if (a < 0.003) discard;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

/** Polar jet: brightest at the base, thinning and fading toward the tip. */
const JET_VERT = /* glsl */ `
  varying float vAxis;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    // A cone's UV.y runs 0 at the base to 1 at the apex.
    vAxis = uv.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const JET_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uStrength;
  varying float vAxis;
  varying vec2 vUv;

  void main() {
    float along = pow(1.0 - vAxis, 2.2);
    // Fading across the sweep stops the open cone showing a hard seam.
    float across = sin(vUv.x * 3.14159);
    float a = along * across * uStrength;
    if (a < 0.004) discard;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

/* ------------------------------------------------------------- DATA CORE --
   A contained singularity: a small faceted body inside two thin counter-
   rotating gimbals. Deliberately compact — the camera passes close to it.
   -------------------------------------------------------------------------- */

export function DataCore({ reduced, accent }: { reduced: boolean; accent: string }) {
  const outer = useRef<THREE.Group>(null);
  const mid = useRef<THREE.Mesh>(null);
  const nucleus = useRef<THREE.Mesh>(null);
  const starMat = useRef<THREE.ShaderMaterial>(null);

  const starUniforms = useMemo(
    () => ({
      uCore: { value: new THREE.Color('#ffffff') },
      uEdge: { value: new THREE.Color(accent) },
      uIntensity: { value: 1.5 },
    }),
    [accent],
  );

  const haloUniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color(accent) }, uStrength: { value: 0.9 } }),
    [accent],
  );

  useFrame(({ clock }, delta) => {
    const d = Math.min(delta, 0.05);
    const t = clock.elapsedTime;
    if (starMat.current) starMat.current.uniforms.uIntensity.value = 1.4 + Math.sin(t * 1.9) * 0.28;
    if (nucleus.current) nucleus.current.scale.setScalar(1 + Math.sin(t * 1.9) * 0.05);
    if (reduced) return;
    if (outer.current) {
      outer.current.rotation.y += d * 0.22;
      outer.current.rotation.x -= d * 0.1;
    }
    if (mid.current) {
      mid.current.rotation.y -= d * 0.36;
      mid.current.rotation.z += d * 0.16;
    }
  });

  return (
    <group>
      <mesh ref={nucleus}>
        <icosahedronGeometry args={[0.62, 1]} />
        <shaderMaterial
          ref={starMat}
          vertexShader={STAR_VERT}
          fragmentShader={STAR_FRAG}
          uniforms={starUniforms}
          fog={false}
        />
      </mesh>

      <mesh scale={2.1}>
        <sphereGeometry args={[0.62, 24, 18]} />
        <shaderMaterial
          vertexShader={STAR_VERT}
          fragmentShader={HALO_FRAG}
          uniforms={haloUniforms}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </mesh>

      <mesh ref={mid}>
        <octahedronGeometry args={[1.15, 0]} />
        <meshBasicMaterial color={accent} wireframe transparent opacity={0.55} />
      </mesh>

      {/* Two thin gimbal rings rather than a dense wire ball. */}
      <group ref={outer}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.75, 0.012, 3, 96]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.42} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2.4, 0.4]}>
          <torusGeometry args={[1.95, 0.01, 3, 96]} />
          <meshBasicMaterial color={accent} transparent opacity={0.5} />
        </mesh>
      </group>

      <pointLight color={accent} intensity={14} distance={14} />
    </group>
  );
}

/* ---------------------------------------------------------------- PULSAR --
   The end of the line. A small, very bright star with polar jets and a thin
   accretion ring — approached but never reached, so it stays a destination
   rather than something the camera ends up inside.
   -------------------------------------------------------------------------- */

export function Beacon({ reduced, accent }: { reduced: boolean; accent: string }) {
  const coreMat = useRef<THREE.ShaderMaterial>(null);
  const haloMat = useRef<THREE.ShaderMaterial>(null);
  const jetMatA = useRef<THREE.ShaderMaterial>(null);
  const jetMatB = useRef<THREE.ShaderMaterial>(null);
  const spin = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);

  const coreUniforms = useMemo(
    () => ({
      uCore: { value: new THREE.Color('#ffffff') },
      uEdge: { value: new THREE.Color(accent) },
      uIntensity: { value: 1.8 },
    }),
    [accent],
  );
  const haloUniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color(accent) }, uStrength: { value: 1 } }),
    [accent],
  );
  const jetUniformsA = useMemo(
    () => ({ uColor: { value: new THREE.Color(accent) }, uStrength: { value: 0.55 } }),
    [accent],
  );
  const jetUniformsB = useMemo(
    () => ({ uColor: { value: new THREE.Color(accent) }, uStrength: { value: 0.55 } }),
    [accent],
  );

  useFrame(({ clock }, delta) => {
    const d = Math.min(delta, 0.05);
    const t = clock.elapsedTime;
    // Sharp attack, slow decay — a pulse rather than a throb.
    const pulse = Math.pow(Math.abs(Math.sin(t * 0.85)), 5) * 0.7 + 0.4;
    if (coreMat.current) coreMat.current.uniforms.uIntensity.value = 1.5 + pulse * 0.9;
    if (haloMat.current) haloMat.current.uniforms.uStrength.value = 0.7 + pulse * 0.8;
    const jetStrength = 0.35 + pulse * 0.5;
    if (jetMatA.current) jetMatA.current.uniforms.uStrength.value = jetStrength;
    if (jetMatB.current) jetMatB.current.uniforms.uStrength.value = jetStrength;
    if (reduced) return;
    // The jets are locked to the spin axis, so they sweep like a lighthouse.
    if (spin.current) spin.current.rotation.y += d * 0.5;
    if (ring.current) ring.current.rotation.z += d * 0.3;
  });

  return (
    <group>
      <group ref={spin} rotation={[0.34, 0, 0.22]}>
        <mesh>
          <sphereGeometry args={[1.15, 32, 24]} />
          <shaderMaterial
            ref={coreMat}
            vertexShader={STAR_VERT}
            fragmentShader={STAR_FRAG}
            uniforms={coreUniforms}
            fog={false}
          />
        </mesh>

        <mesh scale={2.8}>
          <sphereGeometry args={[1.15, 28, 20]} />
          <shaderMaterial
            ref={haloMat}
            vertexShader={STAR_VERT}
            fragmentShader={HALO_FRAG}
            uniforms={haloUniforms}
            transparent
            depthWrite={false}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            fog={false}
          />
        </mesh>

        {/* Opposed jets along the spin axis. Each needs its own material ref,
            or one would animate and the other would sit frozen. */}
        <mesh position={[0, 5.5, 0]}>
          <coneGeometry args={[0.72, 11, 20, 1, true]} />
          <shaderMaterial
            ref={jetMatA}
            vertexShader={JET_VERT}
            fragmentShader={JET_FRAG}
            uniforms={jetUniformsA}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            fog={false}
          />
        </mesh>
        <mesh position={[0, -5.5, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.72, 11, 20, 1, true]} />
          <shaderMaterial
            ref={jetMatB}
            vertexShader={JET_VERT}
            fragmentShader={JET_FRAG}
            uniforms={jetUniformsB}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            fog={false}
          />
        </mesh>
      </group>

      <mesh ref={ring} rotation={[Math.PI / 2.1, 0, 0]}>
        <torusGeometry args={[3.9, 0.022, 3, 128]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <pointLight color={accent} intensity={22} distance={24} />
    </group>
  );
}
