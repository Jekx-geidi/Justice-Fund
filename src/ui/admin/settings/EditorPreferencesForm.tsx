'use client';

import { useState } from 'react';
import type { EditorPreferences, PreviewDevicePreset } from '@/lib/settings/editorPreferences';
import { MaterialButton, MaterialCheckbox, MaterialSelect, MaterialSwitch, MaterialTextField } from '../material/MaterialControls';
import { useMaterialWeb } from '../material/useMaterialWeb';

type Status = 'idle' | 'saving' | 'saved' | 'error';

// Kept in sync with AUTO_SAVE_DELAY_OPTIONS in src/lib/settings/editorPreferences.ts
// (that module is server-only, so its values can't be imported into this client component).
const AUTO_SAVE_DELAY_OPTIONS = [1, 2, 3, 5] as const;

function randomDeviceId() {
  return `custom-${Math.random().toString(36).slice(2, 9)}`;
}

export function EditorPreferencesForm({ initial }: { initial: EditorPreferences }) {
  const [values, setValues] = useState(initial);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceWidth, setNewDeviceWidth] = useState('');
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const materialReady = useMaterialWeb([
    () => import('@material/web/switch/switch.js'),
    () => import('@material/web/checkbox/checkbox.js'),
    () => import('@material/web/select/outlined-select.js'),
    () => import('@material/web/select/select-option.js'),
    () => import('@material/web/textfield/outlined-text-field.js'),
    () => import('@material/web/button/filled-button.js'),
    () => import('@material/web/button/outlined-button.js'),
  ]);

  function set<K extends keyof EditorPreferences>(key: K, value: EditorPreferences[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setStatus('idle');
  }

  function toggleDevice(id: string, enabled: boolean) {
    const nextDevices = values.previewDevices.map((device) => (device.id === id ? { ...device, enabled } : device));
    if (!nextDevices.some((device) => device.enabled)) return;
    set('previewDevices', nextDevices);
    if (!enabled && values.defaultPreviewDeviceId === id) {
      const fallback = nextDevices.find((device) => device.enabled);
      if (fallback) set('defaultPreviewDeviceId', fallback.id);
    }
  }

  function removeDevice(id: string) {
    const nextDevices = values.previewDevices.filter((device) => device.id !== id);
    setValues((prev) => ({
      ...prev,
      previewDevices: nextDevices,
      defaultPreviewDeviceId:
        prev.defaultPreviewDeviceId === id
          ? nextDevices.find((device) => device.enabled)?.id ?? nextDevices[0]?.id ?? prev.defaultPreviewDeviceId
          : prev.defaultPreviewDeviceId,
    }));
    setStatus('idle');
  }

  function addDevice() {
    const width = Number(newDeviceWidth);
    if (!newDeviceName.trim()) {
      setDeviceError('Enter a name for the preview device.');
      return;
    }
    if (!Number.isFinite(width) || width < 280 || width > 2560) {
      setDeviceError('Width must be between 280px and 2560px.');
      return;
    }
    const device: PreviewDevicePreset = {
      id: randomDeviceId(),
      name: newDeviceName.trim(),
      width: Math.round(width),
      enabled: true,
      builtIn: false,
    };
    setDeviceError(null);
    set('previewDevices', [...values.previewDevices, device]);
    setNewDeviceName('');
    setNewDeviceWidth('');
  }

  const enabledDevices = values.previewDevices.filter((device) => device.enabled);
  const defaultDeviceValue = enabledDevices.some((device) => device.id === values.defaultPreviewDeviceId)
    ? values.defaultPreviewDeviceId
    : enabledDevices[0]?.id ?? '';

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setStatus('saving');
    setError(null);

    const response = await fetch('/api/admin/editor-preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        livePreviewEnabled: values.livePreviewEnabled,
        autoSaveEnabled: values.autoSaveEnabled,
        autoSaveDelaySeconds: values.autoSaveDelaySeconds,
        previewDevices: values.previewDevices,
        defaultPreviewDeviceId: defaultDeviceValue,
        rememberLastPreviewDevice: values.rememberLastPreviewDevice,
        highlightActiveField: values.highlightActiveField,
        warnUnsavedChanges: values.warnUnsavedChanges,
      }),
    }).catch(() => null);

    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setStatus('error');
      setError(body?.error ?? 'Preferences could not be saved. Please try again.');
      return;
    }

    setStatus('saved');
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div>
        <h3 className="text-sm font-medium mb-1">Live preview</h3>
        <MaterialSwitch
          ready={materialReady}
          id="pref-live-preview"
          checked={values.livePreviewEnabled}
          onChange={(checked) => set('livePreviewEnabled', checked)}
          label="Live preview while editing"
          description="Show changes in the page preview as you edit."
        />
      </div>

      <div className="border-t border-[var(--line)] pt-4">
        <h3 className="text-sm font-medium mb-1">Auto-save</h3>
        <MaterialSwitch
          ready={materialReady}
          id="pref-auto-save"
          checked={values.autoSaveEnabled}
          onChange={(checked) => set('autoSaveEnabled', checked)}
          label="Auto-save draft while editing"
          description="Automatically save your draft after you stop editing. Manual Save Draft still works either way."
        />
        {values.autoSaveEnabled && (
          <div className="mt-3 max-w-[200px]">
            <MaterialSelect
              ready={materialReady}
              id="pref-auto-save-delay"
              label="Auto-save delay"
              value={String(values.autoSaveDelaySeconds)}
              onChange={(value) => set('autoSaveDelaySeconds', Number(value) as EditorPreferences['autoSaveDelaySeconds'])}
              options={AUTO_SAVE_DELAY_OPTIONS.map((seconds) => ({ value: String(seconds), label: `${seconds} second${seconds === 1 ? '' : 's'}` }))}
            />
          </div>
        )}
      </div>

      <div className="border-t border-[var(--line)] pt-4">
        <h3 className="text-sm font-medium mb-1">Preview devices</h3>
        <p className="text-xs text-[var(--slate)] mb-3">
          Choose which widths appear in the page editor&rsquo;s preview selector. This only affects the admin preview
          — it doesn&rsquo;t change the public site&rsquo;s actual responsive breakpoints.
        </p>
        <div>
          {values.previewDevices.map((device) => (
            <div key={device.id} className="flex items-center justify-between gap-3 border-b border-[var(--line)] last:border-0 py-1">
              <MaterialCheckbox
                ready={materialReady}
                id={`pref-device-${device.id}`}
                checked={device.enabled}
                onChange={(checked) => toggleDevice(device.id, checked)}
                label={`${device.name} (${device.width}px)`}
              />
              {!device.builtIn && (
                <button type="button" onClick={() => removeDevice(device.id)} className="text-xs text-red-700 underline shrink-0">
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div className="w-40">
            <MaterialTextField ready={materialReady} id="pref-new-device-name" label="Name" value={newDeviceName} onChange={setNewDeviceName} maxLength={60} />
          </div>
          <div className="w-28">
            <MaterialTextField ready={materialReady} id="pref-new-device-width" label="Width (px)" value={newDeviceWidth} onChange={setNewDeviceWidth} maxLength={4} />
          </div>
          <MaterialButton ready={materialReady} variant="outlined" onClick={addDevice}>
            + Add custom preview
          </MaterialButton>
        </div>
        {deviceError && (
          <p role="alert" className="text-sm text-red-700 mt-2">
            {deviceError}
          </p>
        )}

        <div className="mt-4 max-w-[200px]">
          <MaterialSelect
            ready={materialReady}
            id="pref-default-device"
            label="Default preview device"
            value={defaultDeviceValue}
            onChange={(value) => set('defaultPreviewDeviceId', value)}
            options={enabledDevices.map((device) => ({ value: device.id, label: device.name }))}
          />
        </div>
      </div>

      <div className="border-t border-[var(--line)] pt-4">
        <MaterialSwitch
          ready={materialReady}
          id="pref-remember-device"
          checked={values.rememberLastPreviewDevice}
          onChange={(checked) => set('rememberLastPreviewDevice', checked)}
          label="Remember my last selected preview device"
        />
        <MaterialSwitch
          ready={materialReady}
          id="pref-highlight-field"
          checked={values.highlightActiveField}
          onChange={(checked) => set('highlightActiveField', checked)}
          label="Highlight the section I am editing"
          description="Subtly outlines the matching area in the live preview."
        />
        <MaterialSwitch
          ready={materialReady}
          id="pref-warn-unsaved"
          checked={values.warnUnsavedChanges}
          onChange={(checked) => set('warnUnsavedChanges', checked)}
          label="Warn me before leaving with unsaved changes"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <MaterialButton ready={materialReady} variant="filled" type="submit" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : 'Save Changes'}
        </MaterialButton>
        {status === 'saved' && <span className="text-sm text-green-700">Saved</span>}
      </div>
      <p className="text-xs text-[var(--slate)]">
        These preferences are saved now. The page editor will start honoring live preview, auto-save, and preview
        device behavior from them in an upcoming update.
      </p>
    </form>
  );
}
