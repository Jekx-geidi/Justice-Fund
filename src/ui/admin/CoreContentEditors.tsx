'use client';

import { PenLine } from 'lucide-react';
import type { AboutFields } from '@/lib/content/types';
import { SITE_EDITOR_HREF } from '@/lib/design/types';
import { MaterialTextField } from './material/MaterialControls';
import { useMaterialWeb } from './material/useMaterialWeb';

const TEXT_FIELD_LOADERS = [() => import('@material/web/textfield/outlined-text-field.js')];

/**
 * Core page editors expose only what the public page actually renders. Anything the
 * page no longer shows (old hero, quotes, photo, entity/ABN, location…) stays in the
 * stored content untouched, it just isn't offered for editing here.
 */

/** For values owned by the on-site Site settings panel, so they're never edited in two places. */
export function SiteSettingsNotice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border border-[var(--line)] p-4">
      <legend className="text-sm font-medium px-1">{title}</legend>
      <p className="text-sm text-[var(--slate)] mb-4">{children}</p>
      <a href={SITE_EDITOR_HREF} className="button button-dark inline-flex items-center gap-1.5">
        <PenLine size={14} aria-hidden="true" />
        Open Site Editor
      </a>
    </fieldset>
  );
}

export function AboutFieldsEditor({ value, onChange }: { value: AboutFields; onChange: (next: AboutFields) => void }) {
  const materialReady = useMaterialWeb(TEXT_FIELD_LOADERS);

  function renameFocusArea(index: number, title: string) {
    const focusAreas = [...value.focusAreas];
    focusAreas[index] = { ...focusAreas[index], title };
    onChange({ ...value, focusAreas });
  }

  return (
    <div className="space-y-6">
      <fieldset className="border border-[var(--line)] p-4 space-y-4">
        <legend className="text-sm font-medium px-1">About content</legend>
        <MaterialTextField
          ready={materialReady}
          id="about-intro"
          label="Paragraph 1"
          value={value.intro}
          onChange={(intro) => onChange({ ...value, intro })}
          multiline
          rows={4}
          maxLength={2000}
        />
        <MaterialTextField
          ready={materialReady}
          id="about-body"
          label="Paragraph 2"
          value={value.body}
          onChange={(body) => onChange({ ...value, body })}
          multiline
          rows={5}
          maxLength={4000}
        />
      </fieldset>
      <fieldset className="border border-[var(--line)] p-4 space-y-4">
        <legend className="text-sm font-medium px-1">Focus areas</legend>
        <p className="text-xs text-[var(--slate)]">
          Each area shows as a black box. Descriptions read &ldquo;Description to come.&rdquo; until the final copy is approved.
        </p>
        {value.focusAreas.map((area, index) => (
          <MaterialTextField
            key={index}
            ready={materialReady}
            id={`focus-title-${index}`}
            label={`Focus area ${index + 1}`}
            value={area.title}
            onChange={(title) => renameFocusArea(index, title)}
            maxLength={120}
          />
        ))}
      </fieldset>
    </div>
  );
}
