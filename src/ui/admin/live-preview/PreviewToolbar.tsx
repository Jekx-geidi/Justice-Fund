import { ArrowUpRight } from 'lucide-react';
import { DeviceToggle } from './DeviceToggle';
import { PreviewStatus } from './PreviewStatus';
import type { DeviceMode } from './PreviewViewport';

export function PreviewToolbar({
  mode,
  onModeChange,
  dirty,
  fullPreviewHref,
}: {
  mode: DeviceMode;
  onModeChange: (mode: DeviceMode) => void;
  dirty: boolean;
  fullPreviewHref: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] px-4 py-2 bg-white sticky top-0 z-10">
      <div>
        <p className="text-xs font-medium tracking-[0.08em] uppercase text-[var(--gold)]">Live Draft Preview</p>
        <PreviewStatus dirty={dirty} />
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
        <DeviceToggle mode={mode} onChange={onModeChange} />
        <a
          href={fullPreviewHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 items-center gap-1 text-xs underline whitespace-nowrap"
        >
          Open Full Preview
          <ArrowUpRight size={12} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
