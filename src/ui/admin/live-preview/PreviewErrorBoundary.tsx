'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  /** Changing this (e.g. a serialized form state) clears a previous error so editing further can recover. */
  resetKey?: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * A broken preview render must never take the editor down with it — the
 * admin's unsaved edits live in the editor's own state, not here (Live
 * Preview PRD §36).
 */
export class PreviewErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Live preview render failed:', error);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center text-sm text-[var(--slate)]">
          <p className="font-medium text-[var(--ink)] mb-1">Preview unavailable</p>
          <p>Your draft has not been lost. Continue editing or open Full Preview.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
