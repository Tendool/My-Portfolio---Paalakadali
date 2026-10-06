'use client';

import dynamic from 'next/dynamic';
import { useRef } from 'react';
import type { FigureKind } from '@/lib/data';

const FigureView = dynamic(() => import('./FigureView'), { ssr: false });

/**
 * An illustration slot. The slot itself is transparent — the drawing comes
 * from the canvas behind the page — and framed with crop marks so it reads
 * as a plate in a printed report.
 */
export default function Figure({
  kind,
  className = '',
  slotClassName = 'aspect-[4/3]',
  label,
}: {
  kind: FigureKind;
  className?: string;
  slotClassName?: string;
  /** Accessible description of what the drawing shows. */
  label: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  return (
    <div className={className}>
      <div ref={host} role="img" aria-label={label} className={`figure-slot crop relative ${slotClassName}`}>
        <FigureView kind={kind} host={host} />
      </div>
    </div>
  );
}
