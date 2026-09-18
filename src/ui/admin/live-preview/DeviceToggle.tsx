'use client';

import { Monitor, Tablet, Smartphone } from 'lucide-react';
import type { DeviceMode } from './PreviewViewport';

const OPTIONS: { mode: DeviceMode; label: string; Icon: typeof Monitor }[] = [
  { mode: 'desktop', label: 'Desktop', Icon: Monitor },
  { mode: 'tablet', label: 'Tablet', Icon: Tablet },
  { mode: 'mobile', label: 'Mobile', Icon: Smartphone },
];

export function DeviceToggle({ mode, onChange }: { mode: DeviceMode; onChange: (mode: DeviceMode) => void }) {
  return (
    <div role="group" aria-label="Preview device size" className="flex items-center gap-1">
      {OPTIONS.map(({ mode: optionMode, label, Icon }) => (
        <button
          key={optionMode}
          type="button"
          aria-pressed={mode === optionMode}
          onClick={() => onChange(optionMode)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded ${
            mode === optionMode ? 'bg-[var(--ink)] text-white' : 'text-[var(--slate)] hover:text-[var(--ink)]'
          }`}
        >
          <Icon size={14} aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  );
}
