'use client';

import { useState } from 'react';
import { PreviewToolbar } from './PreviewToolbar';
import { PreviewViewport, type DeviceMode } from './PreviewViewport';
import { PreviewErrorBoundary } from './PreviewErrorBoundary';

export function LivePreviewPane({
  dirty,
  fullPreviewHref,
  resetKey,
  children,
}: {
  dirty: boolean;
  fullPreviewHref: string;
  /** A value that changes when the previewed content changes meaningfully, so a prior render error can clear. */
  resetKey: string;
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<DeviceMode>('desktop');

  return (
    <div className="live-preview-pane flex flex-col h-full bg-[var(--paper)] border-l border-[var(--line)]">
      <PreviewToolbar mode={mode} onModeChange={setMode} dirty={dirty} fullPreviewHref={fullPreviewHref} />
      <div className="flex-1 overflow-auto py-6">
        <PreviewErrorBoundary resetKey={resetKey}>
          <PreviewViewport mode={mode}>{children}</PreviewViewport>
        </PreviewErrorBoundary>
      </div>
    </div>
  );
}
