'use client';

import type { RefObject } from 'react';
import { View } from '@react-three/drei';
import type { FigureKind } from '@/lib/data';
import { Agents, Bloch, Eye, Pills, Pipeline, Steps, Voice } from './scenes';

const SCENES = { pipeline: Pipeline, agents: Agents, voice: Voice, steps: Steps, eye: Eye, bloch: Bloch, pills: Pills };

/**
 * The DOM half of a figure. drei's View renders this box into the page and
 * tunnels the scene into the shared canvas, which draws it at this box's
 * position every frame.
 */
export default function FigureView({
  kind,
  host,
}: {
  kind: FigureKind;
  host: RefObject<HTMLDivElement | null>;
}) {
  const Scene = SCENES[kind];
  return (
    // index 2: drawn after the backdrop, which renders at priority 1.
    <View className="absolute inset-0" index={2}>
      <Scene host={host} />
    </View>
  );
}
