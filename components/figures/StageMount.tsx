'use client';

import dynamic from 'next/dynamic';
import { Component, type ReactNode } from 'react';

// three.js never runs on the server; the stage and everything it imports
// load on the client only.
const Stage = dynamic(() => import('./Stage'), { ssr: false });

/** No WebGL (or a lost context) must cost the page its figures, nothing more. */
class Quiet extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function StageMount() {
  return (
    <Quiet>
      <Stage />
    </Quiet>
  );
}
