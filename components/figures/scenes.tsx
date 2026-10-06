'use client';

import * as THREE from 'three';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera, RoundedBox } from '@react-three/drei';
import { makeDither, makeLine, pointer, reducedMotion, useFigure } from './dither';

export type SceneProps = { host: RefObject<HTMLDivElement | null> };

const X = new THREE.Vector3(1, 0, 0);
const Y = new THREE.Vector3(0, 1, 0);

/** Cylinder spanning a → b, for graph edges and axes. */
function Segment({
  a,
  b,
  radius,
  material,
}: {
  a: THREE.Vector3;
  b: THREE.Vector3;
  radius: number;
  material: THREE.Material;
}) {
  const { position, quaternion, length } = useMemo(() => {
    const dir = b.clone().sub(a);
    return {
      position: a.clone().add(b).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(Y, dir.clone().normalize()),
      length: dir.length(),
    };
  }, [a, b]);
  return (
    <mesh position={position} quaternion={quaternion} material={material}>
      <cylinderGeometry args={[radius, radius, length, 8, 1, true]} />
    </mesh>
  );
}

/* -------------------------------------------------------------- the hero */

const NET = [4, 6, 6, 4];
const NET_X = [-0.8, -0.27, 0.27, 0.8];
const NET_GAP = 0.34;
const DB_X = -2.0;
const DB_LEVELS = [0.78, 0.47, 0.16];
const PHONE = new THREE.Vector3(2.0, -0.32, 0.18);
const PACKETS = 9;
const TOKENS = 7;
const SPIKES = 5;
const HOP_TIME = 0.4;
const CHAT = [
  { y: 0.48, w: 0.42, right: true },
  { y: 0.27, w: 0.52 },
  { y: 0.12, w: 0.46 },
  { y: -0.03, w: 0.5 },
  { y: -0.18, w: 0.3 },
];

/** Every segment a → b drawn by one instanced, stretched unit cylinder. */
function makeSegments(pairs: [THREE.Vector3, THREE.Vector3][], radius: number, material: THREE.Material) {
  const geo = new THREE.CylinderGeometry(1, 1, 1, 6, 1, true);
  const mesh = new THREE.InstancedMesh(geo, material, pairs.length);
  const q = new THREE.Quaternion();
  const mat = new THREE.Matrix4();
  const scale = new THREE.Vector3();
  pairs.forEach(([a, b], i) => {
    const dir = b.clone().sub(a);
    q.setFromUnitVectors(Y, dir.clone().normalize());
    mat.compose(a.clone().add(b).multiplyScalar(0.5), q, scale.set(radius, dir.length(), radius));
    mesh.setMatrixAt(i, mat);
  });
  mesh.frustumCulled = false;
  return mesh;
}

const bezier = (out: THREE.Vector3, a: THREE.Vector3, c: THREE.Vector3, b: THREE.Vector3, t: number) => {
  const s = 1 - t;
  return out.set(
    s * s * a.x + 2 * s * t * c.x + t * t * b.x,
    s * s * a.y + 2 * s * t * c.y + t * t * b.y,
    s * s * a.z + 2 * s * t * c.z + t * t * b.z,
  );
};

/**
 * The hero: the whole job in one drawing. Records stream out of a stack of
 * databases into a neural network, signals fire through its layers, and the
 * answer flies out as tokens into a phone, where a reply types itself out.
 * Drag it to turn it — it keeps the throw, then settles back to its resting
 * angle.
 */
export function Pipeline({ host }: SceneProps) {
  const u = useFigure(host);
  const m = useMemo(
    () => ({
      db: makeDither(u, 0.06),
      node: makeDither(u, 0.12),
      line: makeLine(u),
      packet: makeDither(u, -0.15),
      body: makeDither(u, 0.2),
      screen: makeDither(u, -0.72),
      bubble: makeDither(u, 0.8),
    }),
    [u],
  );

  const nodes = useMemo(
    () =>
      NET.map((count, l) =>
        Array.from({ length: count }, (_, j) => {
          const z = (j % 2 === 0 ? 1 : -1) * 0.14 * (l % 2 === 0 ? 1 : -1);
          return new THREE.Vector3(NET_X[l], (j - (count - 1) / 2) * NET_GAP, z);
        }),
      ),
    [],
  );
  const edges = useMemo(() => {
    const pairs: [THREE.Vector3, THREE.Vector3][] = [];
    for (let l = 0; l < nodes.length - 1; l++) for (const a of nodes[l]) for (const b of nodes[l + 1]) pairs.push([a, b]);
    return makeSegments(pairs, 0.0065, m.line);
  }, [nodes, m.line]);

  const nodeRefs = useRef<(THREE.Mesh | null)[][]>(NET.map(() => []));
  const fired = useRef<number[][]>(NET.map((c) => Array(c).fill(-10)));
  const packetRefs = useRef<(THREE.Mesh | null)[]>([]);
  const tokenRefs = useRef<(THREE.Mesh | null)[]>([]);
  const spikeRefs = useRef<(THREE.Mesh | null)[]>([]);
  const bubbleRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Random choices are re-rolled each time an item starts a new trip.
  const packetRoute = useRef(Array.from({ length: PACKETS }, () => ({ lap: -1, from: 0, to: 0 })));
  const tokenRoute = useRef(Array.from({ length: TOKENS }, () => ({ lap: -1, from: 0, y: 0 })));
  const spikeRoute = useRef(Array.from({ length: SPIKES }, () => ({ lap: -1, path: [0, 0, 0, 0] })));
  const tmp = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), c: new THREE.Vector3() }), []);

  const drag = useRef<THREE.Group>(null);
  const sway = useRef<THREE.Group>(null);
  const spin = useRef({ dragging: false, lx: 0, ly: 0, px: 0, py: 0, vx: 0, vy: 0, released: -10 });
  const rest = useMemo(() => new THREE.Quaternion(), []);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const s = spin.current;
    const down = (e: PointerEvent) => {
      s.dragging = true;
      s.lx = e.clientX;
      s.ly = e.clientY;
      el.setPointerCapture(e.pointerId);
      el.dataset.dragging = '';
    };
    const move = (e: PointerEvent) => {
      if (!s.dragging) return;
      s.py += (e.clientX - s.lx) * 0.007;
      s.px += (e.clientY - s.ly) * 0.007;
      s.lx = e.clientX;
      s.ly = e.clientY;
    };
    const up = () => {
      s.dragging = false;
      s.released = performance.now() / 1000;
      delete el.dataset.dragging;
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, [host]);

  useFrame((state, delta) => {
    const still = reducedMotion();
    const t = still ? 3.1 : state.clock.elapsedTime;
    const dt = Math.min(delta, 1 / 20);

    // ---- turning: drag with inertia, then settle back
    const g = drag.current;
    const s = spin.current;
    if (g) {
      if (s.dragging) {
        g.rotateOnWorldAxis(Y, s.py);
        g.rotateOnWorldAxis(X, s.px);
        s.vy += (s.py / dt - s.vy) * 0.5;
        s.vx += (s.px / dt - s.vx) * 0.5;
        s.px = s.py = 0;
      } else {
        g.rotateOnWorldAxis(Y, s.vy * dt);
        g.rotateOnWorldAxis(X, s.vx * dt);
        const f = Math.exp(-dt * 1.8);
        s.vx *= f;
        s.vy *= f;
        if (performance.now() / 1000 - s.released > 1.4) g.quaternion.slerp(rest, 1 - Math.exp(-dt * 1.2));
      }
    }
    if (sway.current && !still) {
      sway.current.rotation.y = -0.55 + Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      sway.current.rotation.x = 0.32 + Math.sin(state.clock.elapsedTime * 0.15) * 0.04;
    }

    // ---- records: database → input layer
    packetRefs.current.forEach((p, k) => {
      if (!p) return;
      const phase = t * 0.32 + k / PACKETS;
      const lap = Math.floor(phase);
      const f = phase - lap;
      const r = packetRoute.current[k];
      if (r.lap !== lap) {
        r.lap = lap;
        r.from = Math.floor(Math.random() * DB_LEVELS.length);
        r.to = Math.floor(Math.random() * NET[0]);
      }
      tmp.a.set(DB_X + 0.52, DB_LEVELS[r.from], 0);
      tmp.b.copy(nodes[0][r.to]);
      tmp.c.copy(tmp.a).add(tmp.b).multiplyScalar(0.5).add(Y);
      tmp.c.y = Math.max(tmp.a.y, tmp.b.y) + 0.25;
      bezier(p.position, tmp.a, tmp.c, tmp.b, f);
      p.rotation.set(t * 1.3 + k, t * 0.9 + k, 0);
      if (f > 0.94) fired.current[0][r.to] = t;
    });

    // ---- signals through the network
    spikeRefs.current.forEach((spike, k) => {
      if (!spike) return;
      const local = t / HOP_TIME + (k * NET.length) / SPIKES;
      const lap = Math.floor(local / NET.length);
      const step = Math.floor(local % NET.length);
      const f = local % 1;
      const r = spikeRoute.current[k];
      if (r.lap !== lap) {
        r.lap = lap;
        r.path = NET.map((c) => Math.floor(Math.random() * c));
      }
      if (step >= NET.length - 1) {
        spike.visible = false;
        return;
      }
      spike.visible = true;
      spike.position.lerpVectors(nodes[step][r.path[step]], nodes[step + 1][r.path[step + 1]], f);
      if (f > 0.92) fired.current[step + 1][r.path[step + 1]] = t;
    });

    // ---- answer: output layer → phone
    tokenRefs.current.forEach((p, k) => {
      if (!p) return;
      const phase = t * 0.42 + k / TOKENS;
      const lap = Math.floor(phase);
      const f = phase - lap;
      const r = tokenRoute.current[k];
      if (r.lap !== lap) {
        r.lap = lap;
        r.from = Math.floor(Math.random() * NET[NET.length - 1]);
        r.y = (Math.random() - 0.5) * 0.6;
      }
      tmp.a.copy(nodes[NET.length - 1][r.from]);
      tmp.b.set(PHONE.x - 0.46, PHONE.y + r.y, PHONE.z);
      tmp.c.copy(tmp.a).add(tmp.b).multiplyScalar(0.5);
      tmp.c.y += 0.3;
      bezier(p.position, tmp.a, tmp.c, tmp.b, f);
      p.scale.setScalar(f > 0.9 ? (1 - f) * 10 : 1);
    });

    nodeRefs.current.forEach((layer, l) =>
      layer.forEach((node, j) => {
        if (!node) return;
        const since = t - fired.current[l][j];
        node.scale.setScalar(1 + 0.45 * Math.exp(-since * 5) * (since >= 0 ? 1 : 0));
      }),
    );

    // ---- the reply types itself out on the phone, then clears
    const cycle = t % 7;
    bubbleRefs.current.forEach((b, i) => {
      if (!b) return;
      const start = i === 0 ? 0.2 : 1.1 + (i - 1) * 1.05;
      const grow = THREE.MathUtils.clamp((cycle - start) / (i === 0 ? 0.3 : 0.95), 0, 1);
      const clear = cycle > 6.4 ? 1 - (cycle - 6.4) / 0.6 : 1;
      const w = CHAT[i].w * grow * clear;
      b.visible = w > 0.005;
      b.scale.x = Math.max(w, 0.001);
      b.position.x = CHAT[i].right ? 0.29 - w / 2 : -0.29 + w / 2;
    });
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 7.8]} fov={32} />
      <group ref={drag} position={[-0.12, 0, 0]}>
        <group ref={sway} rotation={[0.32, -0.55, 0]}>
          {/* data */}
          {DB_LEVELS.map((y, i) => (
            <group key={i} position={[DB_X, y, 0]}>
              <mesh material={m.db}>
                <cylinderGeometry args={[0.52, 0.52, 0.25, 56]} />
              </mesh>
              <mesh position={[0, 0.125, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.line}>
                <torusGeometry args={[0.52, 0.012, 6, 96]} />
              </mesh>
            </group>
          ))}
          {Array.from({ length: PACKETS }, (_, k) => (
            <mesh
              key={k}
              ref={(el) => {
                packetRefs.current[k] = el;
              }}
              material={m.packet}
            >
              <boxGeometry args={[0.1, 0.1, 0.1]} />
            </mesh>
          ))}

          {/* model */}
          <primitive object={edges} />
          {nodes.map((layer, l) =>
            layer.map((p, j) => (
              <mesh
                key={`${l}-${j}`}
                ref={(el) => {
                  nodeRefs.current[l][j] = el;
                }}
                position={p}
                material={m.node}
              >
                <sphereGeometry args={[0.105, 32, 24]} />
              </mesh>
            )),
          )}
          {Array.from({ length: SPIKES }, (_, k) => (
            <mesh
              key={k}
              ref={(el) => {
                spikeRefs.current[k] = el;
              }}
              material={m.line}
            >
              <sphereGeometry args={[0.045, 12, 10]} />
            </mesh>
          ))}

          {/* answer */}
          {Array.from({ length: TOKENS }, (_, k) => (
            <mesh
              key={k}
              ref={(el) => {
                tokenRefs.current[k] = el;
              }}
              material={m.line}
            >
              <sphereGeometry args={[0.04, 12, 10]} />
            </mesh>
          ))}

          {/* device */}
          <group position={PHONE} rotation={[0, 0.42, 0]}>
            <RoundedBox args={[0.84, 1.6, 0.11]} radius={0.09} smoothness={4} material={m.body} />
            <mesh position={[0, 0, 0.056]} material={m.screen}>
              <boxGeometry args={[0.7, 1.38, 0.01]} />
            </mesh>
            {CHAT.map((c, i) => (
              <mesh
                key={i}
                ref={(el) => {
                  bubbleRefs.current[i] = el;
                }}
                position={[0, c.y, 0.066]}
                material={m.bubble}
                visible={false}
              >
                <boxGeometry args={[1, i === 0 ? 0.11 : 0.075, 0.012]} />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    </>
  );
}

/* ------------------------------------------------------------ agent graph */

/**
 * Agent graph: an orchestrator at the centre, three agents round it, and the
 * policy documents the search agent reads. Messages run out along each edge
 * and back.
 */
export function Agents({ host }: SceneProps) {
  const u = useFigure(host);
  const m = useMemo(
    () => ({ node: makeDither(u, 0.05), line: makeLine(u), doc: makeDither(u, 0.2), pulse: makeLine(u) }),
    [u],
  );

  const layout = useMemo(() => {
    const centre = new THREE.Vector3(0, 0, 0);
    const lift = [0.3, -0.18, 0.08];
    const agents = [0, 1, 2].map((k) => {
      const a = Math.PI / 2 + (k * Math.PI * 2) / 3;
      return new THREE.Vector3(Math.cos(a) * 1.2, lift[k], Math.sin(a) * 1.2);
    });
    // The search agent (agents[1]) reads a small fan of policy pages just
    // beyond it. The pages always turn to face the viewer (see useFrame), so
    // they read as sheets of paper rather than slivers seen edge-on.
    const search = agents[1];
    const out = search.clone().setY(0).normalize();
    const side = new THREE.Vector3(-out.z, 0, out.x);
    const docs = [-1, 0, 1].map((i) => ({
      position: search
        .clone()
        .add(out.clone().multiplyScalar(0.58 - Math.abs(i) * 0.1))
        .add(side.clone().multiplyScalar(i * 0.3))
        .setY(search.y + 0.08 - Math.abs(i) * 0.06),
      tilt: i * -0.2,
    }));
    return { centre, agents, docs, search };
  }, []);

  const group = useRef<THREE.Group>(null);
  const pulses = useRef<(THREE.Mesh | null)[]>([]);
  const pages = useRef<(THREE.Mesh | null)[]>([]);
  const facing = useMemo(() => ({ q: new THREE.Quaternion(), tilt: new THREE.Quaternion(), z: new THREE.Vector3(0, 0, 1) }), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const still = reducedMotion();
    if (group.current && !still) {
      group.current.rotation.y = t * 0.14;
      group.current.position.y = Math.sin(t * 0.8) * 0.04;
    }
    pulses.current.forEach((p, k) => {
      if (!p) return;
      // Out to the agent and back again, each edge a third of a cycle apart.
      const phase = still ? 0.5 : (t * 0.42 + k / 3) % 1;
      const s = phase < 0.5 ? phase * 2 : 2 - phase * 2;
      const e = s * s * (3 - 2 * s);
      p.position.lerpVectors(layout.centre, layout.agents[k], e);
    });
    // Billboard the pages: undo the parent's world rotation, then fan them.
    if (group.current) {
      group.current.getWorldQuaternion(facing.q).invert();
      pages.current.forEach((pg, i) => {
        if (!pg) return;
        facing.tilt.setFromAxisAngle(facing.z, layout.docs[i].tilt);
        pg.quaternion.copy(facing.q).multiply(facing.tilt);
      });
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 4.9]} fov={36} />
      <group rotation={[0.72, 0, 0]}>
        <group ref={group}>
          <mesh material={m.node}>
            <sphereGeometry args={[0.46, 56, 40]} />
          </mesh>
          {layout.agents.map((a, k) => (
            <group key={k}>
              <mesh position={a} material={m.node}>
                <sphereGeometry args={[0.27, 48, 32]} />
              </mesh>
              <Segment a={layout.centre} b={a} radius={0.02} material={m.line} />
              <mesh
                ref={(el) => {
                  pulses.current[k] = el;
                }}
                material={m.pulse}
              >
                <sphereGeometry args={[0.065, 16, 12]} />
              </mesh>
            </group>
          ))}
          {layout.docs.map((d, i) => (
            <group key={i}>
              <Segment a={layout.search} b={d.position} radius={0.009} material={m.line} />
              <mesh
                ref={(el) => {
                  pages.current[i] = el;
                }}
                position={d.position}
                material={m.doc}
              >
                <boxGeometry args={[0.24, 0.31, 0.03]} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    </>
  );
}

/* ------------------------------------------------------------- voice ring */

const BARS = 40;

/**
 * Voice: a ring of level bars round a sphere standing in for the local model.
 * It "talks" in phrases — bursts of syllables, then a pause.
 */
export function Voice({ host }: SceneProps) {
  const u = useFigure(host);
  const m = useMemo(() => ({ bar: makeDither(u, -0.05), core: makeDither(u, 0.08) }), [u]);
  const capsule = useMemo(() => new THREE.CapsuleGeometry(0.058, 1, 4, 10), []);
  const bars = useRef<(THREE.Mesh | null)[]>([]);
  const core = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const still = reducedMotion();
    const cycle = t % 5.2;
    // Phrase envelope: speak for ~3.6s, then a short silence.
    const phrase = still ? 0.6 : THREE.MathUtils.smoothstep(cycle, 0, 0.3) * (1 - THREE.MathUtils.smoothstep(cycle, 3.4, 3.9));
    const syllable = 0.55 + 0.45 * Math.abs(Math.sin(t * 5.3));

    bars.current.forEach((bar, i) => {
      if (!bar) return;
      const a = (i / BARS) * Math.PI * 2;
      const shape =
        (0.5 + 0.5 * Math.sin(a * 3 + t * 2.1)) * (0.55 + 0.45 * Math.sin(a * 5 - t * 3.7)) +
        0.25 * (0.5 + 0.5 * Math.sin(a * 11 + t * 7.9));
      const h = 0.06 + 0.5 * phrase * syllable * shape;
      const r = 0.9 + h / 2;
      bar.position.set(Math.cos(a) * r, Math.sin(a) * r, 0);
      bar.scale.set(1, h, 1);
    });

    if (core.current) core.current.scale.setScalar(1 + 0.035 * phrase * syllable);
    if (ring.current && !still) ring.current.rotation.z = t * 0.08;
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 4.9]} fov={36} />
      <group rotation={[-0.38, 0.26, 0]}>
        <group ref={ring}>
          {Array.from({ length: BARS }, (_, i) => {
            const a = (i / BARS) * Math.PI * 2;
            return (
              <mesh
                key={i}
                ref={(el) => {
                  bars.current[i] = el;
                }}
                geometry={capsule}
                material={m.bar}
                rotation={[0, 0, a - Math.PI / 2]}
              />
            );
          })}
        </group>
        <mesh ref={core} material={m.core}>
          <sphereGeometry args={[0.58, 64, 48]} />
        </mesh>
      </group>
    </>
  );
}

/* -------------------------------------------------------------------- eye */

/**
 * An eye that follows the cursor. With no mouse it glances around on its own,
 * and the pupil narrows while it is being looked at.
 */
export function Eye({ host }: SceneProps) {
  const u = useFigure(host);
  const m = useMemo(
    () => ({
      ball: makeDither(u, 0.3),
      iris: makeDither(u, -0.16),
      rim: makeDither(u, -0.7),
      pupil: makeDither(u, -0.92),
    }),
    [u],
  );
  const IRIS = 0.46;
  const ball = useRef<THREE.Group>(null);
  const pupil = useRef<THREE.Mesh>(null);
  const s = useRef({ yaw: 0, pitch: 0, glanceAt: 0, gx: 0, gy: 0, dilate: 1 });

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 1 / 20);
    const st = s.current;
    const still = reducedMotion();
    let ty = 0;
    let tp = 0;
    let watched = false;

    const el = host.current;
    if (el && pointer.fine && pointer.inside) {
      const r = el.getBoundingClientRect();
      const dx = pointer.x - (r.left + r.width / 2);
      const dy = pointer.y - (r.top + r.height / 2);
      ty = Math.atan2(dx, 520);
      tp = Math.atan2(dy, 520);
      watched = Math.abs(dx) < r.width / 2 && Math.abs(dy) < r.height / 2;
    } else if (!still) {
      if (t > st.glanceAt) {
        st.gx = (Math.random() - 0.5) * 1.1;
        st.gy = (Math.random() - 0.5) * 0.7;
        st.glanceAt = t + 1.2 + Math.random() * 1.8;
      }
      ty = st.gx;
      tp = st.gy;
    }
    ty = THREE.MathUtils.clamp(ty, -0.75, 0.75);
    tp = THREE.MathUtils.clamp(tp, -0.55, 0.55);
    // Fast, slightly overdamped — eyes snap to a target rather than drift.
    const k = 1 - Math.exp(-dt * 10);
    st.yaw += (ty - st.yaw) * k;
    st.pitch += (tp - st.pitch) * k;
    st.dilate += ((watched ? 0.72 : 1) - st.dilate) * (1 - Math.exp(-dt * 4));

    if (ball.current) ball.current.rotation.set(st.pitch, st.yaw, 0);
    if (pupil.current) pupil.current.scale.set(st.dilate, 1, st.dilate);
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5.2]} fov={32} />
      <group ref={ball}>
        <mesh material={m.ball}>
          <sphereGeometry args={[1, 72, 48]} />
        </mesh>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh material={m.iris}>
            <sphereGeometry args={[1.006, 72, 12, 0, Math.PI * 2, 0, IRIS]} />
          </mesh>
          <mesh position={[0, Math.cos(IRIS) * 1.006, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.rim}>
            <torusGeometry args={[Math.sin(IRIS) * 1.006, 0.022, 8, 96]} />
          </mesh>
          <mesh ref={pupil} material={m.pupil}>
            <sphereGeometry args={[1.012, 48, 8, 0, Math.PI * 2, 0, 0.22]} />
          </mesh>
        </group>
      </group>
    </>
  );
}

/* ------------------------------------------------------------ Bloch sphere */

/**
 * Bloch sphere. The far wall is drawn from the inside (back faces only), so
 * the globe reads as a volume without hiding the state vector inside it.
 */
export function Bloch({ host }: SceneProps) {
  const u = useFigure(host);
  const m = useMemo(
    () => ({
      shell: makeDither(u, 0.3, THREE.BackSide),
      ring: makeLine(u),
      axis: makeLine(u),
      vector: makeDither(u, -0.12),
    }),
    [u],
  );
  const axes = useMemo(
    () => [
      [new THREE.Vector3(0, -1.3, 0), new THREE.Vector3(0, 1.3, 0)],
      [new THREE.Vector3(-1.2, 0, 0), new THREE.Vector3(1.2, 0, 0)],
      [new THREE.Vector3(0, 0, -1.2), new THREE.Vector3(0, 0, 1.2)],
    ],
    [],
  );
  const spin = useRef<THREE.Group>(null);
  const vec = useRef<THREE.Group>(null);
  const dir = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const t = reducedMotion() ? 1.4 : state.clock.elapsedTime;
    const theta = 0.95 + 0.42 * Math.sin(t * 0.55);
    const phi = t * 0.9;
    dir.set(Math.sin(theta) * Math.cos(phi), Math.cos(theta), Math.sin(theta) * Math.sin(phi));
    vec.current?.quaternion.setFromUnitVectors(Y, dir);
    if (spin.current && !reducedMotion()) spin.current.rotation.y = state.clock.elapsedTime * 0.1;
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={34} />
      <group rotation={[0.34, 0, -0.12]}>
        <group ref={spin}>
          <mesh material={m.shell}>
            <sphereGeometry args={[1, 64, 40]} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={m.ring}>
            <torusGeometry args={[1, 0.017, 8, 180]} />
          </mesh>
          <mesh material={m.ring}>
            <torusGeometry args={[1, 0.013, 8, 180]} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]} material={m.ring}>
            <torusGeometry args={[1, 0.013, 8, 180]} />
          </mesh>
          {axes.map(([a, b], i) => (
            <Segment key={i} a={a} b={b} radius={i === 0 ? 0.011 : 0.007} material={m.axis} />
          ))}
          {[1, -1].map((y) => (
            <mesh key={y} position={[0, y, 0]} material={m.axis}>
              <sphereGeometry args={[0.05, 16, 12]} />
            </mesh>
          ))}
          <group ref={vec}>
            <mesh position={[0, 0.42, 0]} material={m.vector}>
              <cylinderGeometry args={[0.03, 0.03, 0.84, 16]} />
            </mesh>
            <mesh position={[0, 0.9, 0]} material={m.vector}>
              <coneGeometry args={[0.085, 0.2, 24]} />
            </mesh>
            <mesh material={m.vector}>
              <sphereGeometry args={[0.07, 20, 14]} />
            </mesh>
          </group>
        </group>
      </group>
    </>
  );
}

/* ---------------------------------------------------------- adaptive steps */

const STEPS = 7;
const STEP_W = 0.4;
const STEP_BASE = -0.92;
const HOP = 0.72;

/**
 * Adaptive tutoring: a ball climbs a staircase one hop at a time while every
 * step's height keeps adjusting — the difficulty fitting itself to the
 * climber. At the top it jumps back down and starts again.
 */
export function Steps({ host }: SceneProps) {
  const u = useFigure(host);
  const m = useMemo(() => ({ step: makeDither(u, 0.14), ball: makeDither(u, -0.3) }), [u]);
  const box = useMemo(() => new THREE.BoxGeometry(STEP_W * 0.94, 1, 0.72), []);
  const steps = useRef<(THREE.Mesh | null)[]>([]);
  const ball = useRef<THREE.Mesh>(null);
  const sway = useRef<THREE.Group>(null);

  useFrame((state) => {
    const still = reducedMotion();
    const t = still ? 2.6 : state.clock.elapsedTime;
    const rise = 0.2 + 0.065 * Math.sin(t * 0.55);
    const x0 = -((STEPS - 1) * STEP_W) / 2;
    const top = (i: number) => STEP_BASE + (i + 1) * rise + 0.15;

    steps.current.forEach((s, i) => {
      if (!s) return;
      const h = (i + 1) * rise;
      s.scale.y = h;
      s.position.y = STEP_BASE + h / 2;
    });

    // STEPS-1 hops up, one beat resting at the top, one long jump back down.
    const beat = Math.floor(t / HOP) % (STEPS + 1);
    const f = (t % HOP) / HOP;
    let from = 0;
    let to = 0;
    let arc = 0.32;
    if (beat < STEPS - 1) {
      from = beat;
      to = beat + 1;
    } else if (beat === STEPS - 1) {
      from = to = STEPS - 1;
      arc = 0;
    } else {
      from = STEPS - 1;
      to = 0;
      arc = 0.7;
    }
    const e = still ? 0 : f;
    if (ball.current) {
      ball.current.position.set(
        x0 + THREE.MathUtils.lerp(from, to, e) * STEP_W,
        THREE.MathUtils.lerp(top(from), top(to), e) + 4 * arc * e * (1 - e),
        0,
      );
    }
    if (sway.current && !still) sway.current.rotation.y = -0.62 + Math.sin(state.clock.elapsedTime * 0.3) * 0.16;
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5.1]} fov={34} />
      <group rotation={[0.3, 0, 0]}>
        <group ref={sway} rotation={[0, -0.62, 0]}>
          {Array.from({ length: STEPS }, (_, i) => (
            <mesh
              key={i}
              ref={(el) => {
                steps.current[i] = el;
              }}
              geometry={box}
              material={m.step}
              position={[-((STEPS - 1) * STEP_W) / 2 + i * STEP_W, 0, 0]}
            />
          ))}
          <mesh ref={ball} material={m.ball}>
            <sphereGeometry args={[0.15, 32, 24]} />
          </mesh>
        </group>
      </group>
    </>
  );
}

/* ------------------------------------------------------- prescription pills */

/** A two-tone capsule: dark half up, light half down, along +Y. */
function Capsule({
  r,
  length,
  dark,
  light,
}: {
  r: number;
  length: number;
  dark: THREE.Material;
  light: THREE.Material;
}) {
  return (
    <>
      <mesh position={[0, length / 4, 0]} material={dark}>
        <cylinderGeometry args={[r, r, length / 2, 32, 1, true]} />
      </mesh>
      <mesh position={[0, length / 2, 0]} material={dark}>
        <sphereGeometry args={[r, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[0, -length / 4, 0]} material={light}>
        <cylinderGeometry args={[r, r, length / 2, 32, 1, true]} />
      </mesh>
      <mesh position={[0, -length / 2, 0]} material={light}>
        <sphereGeometry args={[r, 32, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
      </mesh>
    </>
  );
}

const STREAM = 18;
const CYCLE = 4.4;

/**
 * Prescription validation: a stream of prescriptions circles the frame while
 * two capsules drift together; as they touch, a warning ring pulses out from
 * the contact and they are pushed apart again.
 */
export function Pills({ host }: SceneProps) {
  const u = useFigure(host);
  const m = useMemo(
    () => ({
      dark: makeDither(u, -0.55),
      light: makeDither(u, 0.3),
      stream: makeDither(u, 0.02),
      ring: makeLine(u),
    }),
    [u],
  );
  const small = useMemo(() => new THREE.CapsuleGeometry(0.055, 0.16, 4, 10), []);
  const stream = useRef<(THREE.Mesh | null)[]>([]);
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  const tmp = useMemo(() => ({ tangent: new THREE.Vector3() }), []);

  useFrame((state) => {
    const still = reducedMotion();
    const t = still ? 0 : state.clock.elapsedTime;

    stream.current.forEach((p, i) => {
      if (!p) return;
      const a = (i / STREAM) * Math.PI * 2 + t * 0.32;
      p.position.set(Math.cos(a) * 1.6, Math.sin(i * 2.3) * 0.08, Math.sin(a) * 1.6);
      tmp.tangent.set(-Math.sin(a), 0, Math.cos(a));
      p.quaternion.setFromUnitVectors(Y, tmp.tangent);
    });

    // Approach, touch and flag, then separate.
    const p = still ? 0.5 : (t % CYCLE) / CYCLE;
    const ease = (x: number) => x * x * (3 - 2 * x);
    let gap = 0.42;
    if (p < 0.35) gap = THREE.MathUtils.lerp(1.05, 0.42, ease(p / 0.35));
    else if (p >= 0.62) gap = THREE.MathUtils.lerp(0.42, 1.05, ease((p - 0.62) / 0.38));
    // Each leans in towards the other and rocks gently towards the viewer.
    const rock = still ? 0.2 : 0.22 * Math.sin(state.clock.elapsedTime * 0.9);
    left.current?.position.set(-gap, 0, 0);
    left.current?.rotation.set(rock, 0, 0.52);
    right.current?.position.set(gap, 0, 0);
    right.current?.rotation.set(-rock, 0, -0.52);

    const q = (p - 0.35) / 0.27;
    rings.current.forEach((ring, k) => {
      if (!ring) return;
      const local = q - k * 0.35;
      ring.visible = local > 0 && local < 1;
      ring.scale.setScalar(0.45 + 0.75 * Math.max(0, local));
    });
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5.2]} fov={34} />
      <group rotation={[0.36, 0, 0]}>
        {Array.from({ length: STREAM }, (_, i) => (
          <mesh
            key={i}
            ref={(el) => {
              stream.current[i] = el;
            }}
            geometry={small}
            material={m.stream}
          />
        ))}
      </group>
      <group ref={left}>
        <Capsule r={0.17} length={0.52} dark={m.dark} light={m.light} />
      </group>
      <group ref={right}>
        <Capsule r={0.17} length={0.52} dark={m.dark} light={m.light} />
      </group>
      {[0, 1].map((k) => (
        <mesh
          key={k}
          ref={(el) => {
            rings.current[k] = el;
          }}
          material={m.ring}
          visible={false}
        >
          <torusGeometry args={[0.62, 0.02, 8, 120]} />
        </mesh>
      ))}
    </>
  );
}
