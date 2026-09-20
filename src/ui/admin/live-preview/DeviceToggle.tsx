'use client';

import { ChevronDown, Monitor, Tablet, Smartphone } from 'lucide-react';
import type { DeviceMode } from './PreviewViewport';

const OPTIONS: { mode: DeviceMode; label: string; Icon: typeof Monitor }[] = [
  { mode: 'desktop', label: 'Desktop', Icon: Monitor },
  { mode: 'tablet', label: 'Tablet', Icon: Tablet },
  { mode: 'mobile', label: 'Mobile', Icon: Smartphone },
];

export function DeviceToggle({ mode, onChange }: { mode: DeviceMode; onChange: (mode: DeviceMode) => void }) {
  const { Icon } = OPTIONS.find(option => option.mode === mode)!;
  return (
    <label className="relative inline-flex shrink-0 items-center">
      <span className="sr-only">Preview device size</span>
      <Icon size={16} aria-hidden="true" className="pointer-events-none absolute left-3 text-[var(--slate)]" />
      <select
        value={mode}
        onChange={event => onChange(event.target.value as DeviceMode)}
        className="min-h-11 w-36 cursor-pointer appearance-none rounded border border-[var(--line)] bg-white py-2 pl-9 pr-8 text-sm text-[var(--ink)] transition-colors hover:border-[var(--gold)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)] motion-reduce:transition-none"
      >
        {OPTIONS.map(({ mode: optionMode, label }) => <option key={optionMode} value={optionMode}>{label}</option>)}
      </select>
      <ChevronDown size={14} aria-hidden="true" className="pointer-events-none absolute right-3 text-[var(--slate)]" />
    </label>
  );
}
