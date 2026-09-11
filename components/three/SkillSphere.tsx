'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { ORBIT_NODES, type SkillTier } from '@/lib/data';
import { createBadgeTexture, whenFontsReady } from '@/lib/labelTexture';
import { damp } from '@/lib/flight';
import { useQuality } from '@/lib/quality';

export type OrbitNode = { name: string; tier: SkillTier; group: string };

/* ==========================================================================
   SKILL SPHERE

   Every skill sits on one sphere, spaced by the Fibonacci lattice so no two
   labels ever crowd — which is the failure mode of stacked orbital rings, and
   why this replaced them. Labels billboard toward the camera and fade as they
   rotate to the back, so the far side reads as depth rather than clutter.

   Drag anywhere inside the canvas to spin it; release and it keeps its
   momentum before settling back to a slow idle turn.
   ========================================================================== */

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Evenly distributed points on a sphere. Naive lat/long spacing bunches hard
 * at the poles; the Fibonacci lattice does not.
 */
function fibonacciSphere(count: number, radius: number) {
  return Array.from({ length: count }, (_, i) => {
    // Offset by a half-step so nothing lands exactly on a pole.
    const y = 1 - ((i + 0.5) / count) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = GOLDEN_ANGLE * i;
    return new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(radius);
  });
}

const RANK: Record<SkillTier, number> = { core: 0, prof: 1, work: 2 };

function SkillNode({
  node,
  position,
  onHover,
  hovered,
}: {
  node: OrbitNode;
  position: THREE.Vector3;
  onHover: (n: OrbitNode | null) => void;
  hovered: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const [textures, setTextures] = useState<{ cool: THREE.CanvasTexture; hot: THREE.CanvasTexture } | null>(
    null,
  );

  const { camera } = useThree();
  const world = useMemo(() => new THREE.Vector3(), []);
  const toCamera = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    let cancelled = false;
    let made: THREE.CanvasTexture[] = [];
    whenFontsReady().then(() => {
      if (cancelled) return;
      const cool = createBadgeTexture(node.name, node.tier, false);
      const hot = createBadgeTexture(node.name, node.tier, true);
      made = [cool, hot];
      setTextures({ cool, hot });
    });
    return () => {
      cancelled = true;
      made.forEach((t) => t.dispose());
    };
  }, [node.name, node.tier]);

  useFrame((_, delta) => {
    const g = groupRef.current;
    const m = matRef.current;
    if (!g || !m) return;
    const d = Math.min(delta, 0.05);

    // Fade with depth: a label on the far side of the sphere should read as
    // behind the others, not compete with them.
    g.getWorldPosition(world);
    toCamera.copy(camera.position).sub(world).normalize();
    const facing = world.clone().normalize().dot(toCamera);
    const depth = THREE.MathUtils.clamp((facing + 0.85) / 1.5, 0, 1);

    m.opacity = damp(m.opacity, hovered ? 1 : 0.18 + depth * 0.82, 0.002, d);
    const scale = damp(g.scale.x, hovered ? 1.28 : 0.8 + depth * 0.22, 0.002, d);
    g.scale.setScalar(scale);
    // Hovered labels come forward so nothing overlaps the one being read.
    g.renderOrder = hovered ? 10 : Math.round(depth * 5);
  });

  if (!textures) return null;

  return (
    <group position={position}>
      <Billboard>
        <group ref={groupRef}>
          <mesh
            onPointerOver={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              onHover(node);
            }}
            onPointerOut={() => onHover(null)}
          >
            <planeGeometry args={[1.72, 0.45]} />
            <meshBasicMaterial
              ref={matRef}
              map={hovered ? textures.hot : textures.cool}
              transparent
              opacity={0}
              depthWrite={false}
              depthTest={false}
              toneMapped={false}
            />
          </mesh>
        </group>
      </Billboard>
    </group>
  );
}

/* --------------------------------------------------------------------------
   Hub: a wire cage at the centre so the sphere has an obvious axis.
   -------------------------------------------------------------------------- */

function Hub({ reduced, accent }: { reduced: boolean; accent: string }) {
  const inner = useRef<THREE.Mesh>(null);
  const outer = useRef<THREE.Mesh>(null);

  useFrame(({ clock }, delta) => {
    if (reduced) return;
    const d = Math.min(delta, 0.05);
    if (inner.current) {
      inner.current.rotation.y += d * 0.4;
      inner.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 1.6) * 0.07);
    }
    if (outer.current) {
      outer.current.rotation.y -= d * 0.16;
      outer.current.rotation.x += d * 0.1;
    }
  });

  return (
    <group>
      <mesh ref={inner}>
        <icosahedronGeometry args={[0.38, 0]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={outer}>
        <icosahedronGeometry args={[0.85, 0]} />
        <meshBasicMaterial
          color="#ffffff"
          wireframe
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <pointLight color={accent} intensity={10} distance={10} />
    </group>
  );
}

/* --------------------------------------------------------------------------
   Camera fit — the panel is a wide letterbox on desktop and a tall box on a
   phone. Pull back until the sphere fits whichever axis is tighter.
   -------------------------------------------------------------------------- */

function FitCamera({ radius }: { radius: number }) {
  const { camera, size } = useThree();

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(1, size.height);
    const halfFov = (cam.fov * Math.PI) / 360;
    // Labels are wide and short, so they extend the sphere's reach far more
    // horizontally than vertically. Using one combined margin for both axes
    // made the vertical fit pull the camera much further back than it needed
    // to on a letterbox panel, shrinking every label.
    const vNeed = radius + 0.4;
    const hNeed = radius + 1.0;
    const dist = Math.max(vNeed / Math.tan(halfFov), hNeed / (Math.tan(halfFov) * aspect));
    cam.position.set(0, 0, dist * 1.04);
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
  }, [camera, size.width, size.height, radius]);

  return null;
}

/* -------------------------------------------------------------------------- */

export default function SkillSphere({ onHover }: { onHover: (n: OrbitNode | null) => void }) {
  const q = useQuality();
  const spinRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<OrbitNode | null>(null);

  // Drag state lives in a ref: it changes every pointer move and must not
  // re-render the thirty labels underneath.
  const drag = useRef({ active: false, lastX: 0, lastY: 0, velX: 0, velY: 0, yaw: 0, pitch: 0 });

  const handleHover = (n: OrbitNode | null) => {
    setHovered(n);
    onHover(n);
  };

  const RADIUS = 3.3;

  // Strongest skills first, so the ones trimmed on a weak device are the ones
  // that matter least.
  const nodes = useMemo(() => {
    const ranked = [...ORBIT_NODES].sort((a, b) => RANK[a.tier] - RANK[b.tier]);
    return ranked.slice(0, q.orbitNodes);
  }, [q.orbitNodes]);

  const points = useMemo(() => fibonacciSphere(nodes.length, RADIUS), [nodes.length]);

  useFrame((_, delta) => {
    const g = spinRef.current;
    if (!g || q.reduced) return;
    const d = Math.min(delta, 0.05);
    const s = drag.current;

    if (!s.active) {
      // Coast, then hand back to the idle turn.
      s.velX *= Math.pow(0.92, d * 60);
      s.velY *= Math.pow(0.92, d * 60);
      s.yaw += s.velX + d * 0.12;
      s.pitch += s.velY;
    }
    // Clamp the pitch so the lattice can never be tipped fully edge-on.
    s.pitch = THREE.MathUtils.clamp(s.pitch, -0.9, 0.9);

    g.rotation.y = s.yaw;
    g.rotation.x = damp(g.rotation.x, s.pitch, 0.004, d);
  });

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    drag.current.active = true;
    drag.current.lastX = e.clientX;
    drag.current.lastY = e.clientY;
    drag.current.velX = 0;
    drag.current.velY = 0;
  };

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    const s = drag.current;
    if (!s.active) return;
    const dx = (e.clientX - s.lastX) * 0.006;
    const dy = (e.clientY - s.lastY) * 0.005;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    s.yaw += dx;
    s.pitch += dy;
    s.velX = dx;
    s.velY = dy;
  };

  const onUp = () => {
    drag.current.active = false;
  };

  return (
    <group>
      <FitCamera radius={RADIUS} />

      {/* Invisible catcher so a drag anywhere in the panel spins the sphere,
          not just a drag that happens to land on a label. */}
      <mesh
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        visible={false}
      >
        <sphereGeometry args={[RADIUS * 2.4, 8, 8]} />
        <meshBasicMaterial side={THREE.BackSide} />
      </mesh>

      <Hub reduced={q.reduced} accent="#8b5cf6" />

      <group ref={spinRef}>
        {nodes.map((n, i) => (
          <SkillNode
            key={n.name}
            node={n}
            position={points[i]}
            onHover={handleHover}
            hovered={hovered?.name === n.name}
          />
        ))}
      </group>

      <ambientLight intensity={0.8} />
    </group>
  );
}
