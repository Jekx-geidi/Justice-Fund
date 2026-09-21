'use client';

import type { HomeFields, AboutFields, ContactFields } from '@/lib/content/types';
import { MediaSlot } from './media/MediaSlot';
import { MaterialTextField } from './material/MaterialControls';
import { useMaterialWeb } from './material/useMaterialWeb';

const TEXT_FIELD_LOADERS = [() => import('@material/web/textfield/outlined-text-field.js')];

export function HomeFieldsEditor({ value, onChange }: { value: HomeFields; onChange: (next: HomeFields) => void }) {
  const materialReady = useMaterialWeb(TEXT_FIELD_LOADERS);

  function updateQuote(index: number, field: 'text' | 'attribution', text: string) {
    const quotes = [...value.quotes];
    quotes[index] = { ...quotes[index], [field]: text };
    onChange({ ...value, quotes });
  }

  return (
    <div className="space-y-4">
      <MaterialTextField
        ready={materialReady}
        id="home-eyebrow"
        label="Eyebrow label"
        value={value.eyebrow}
        onChange={(eyebrow) => onChange({ ...value, eyebrow })}
        maxLength={80}
      />
      <MaterialTextField
        ready={materialReady}
        id="home-mission"
        label="Mission statement"
        value={value.mission}
        onChange={(mission) => onChange({ ...value, mission })}
        multiline
        rows={3}
        maxLength={2000}
      />
      <MaterialTextField
        ready={materialReady}
        id="home-bottom"
        label="Bottom identity line"
        value={value.bottomLine}
        onChange={(bottomLine) => onChange({ ...value, bottomLine })}
        maxLength={300}
      />
      <div className="field">
        <label>Hero image</label>
        <MediaSlot image={value.heroImage} onChange={(heroImage) => onChange({ ...value, heroImage })} />
      </div>
      <fieldset className="border border-[var(--line)] p-4">
        <legend className="text-sm font-medium px-1">News quotes (placeholder)</legend>
        {value.quotes.map((quote, index) => (
          <div key={index} className="space-y-2 mb-4 last:mb-0">
            <MaterialTextField
              ready={materialReady}
              id={`quote-text-${index}`}
              label={`Quote ${index + 1}`}
              value={quote.text}
              onChange={(text) => updateQuote(index, 'text', text)}
              multiline
              rows={2}
              maxLength={400}
            />
            <MaterialTextField
              ready={materialReady}
              id={`quote-attr-${index}`}
              label="Attribution"
              value={quote.attribution}
              onChange={(text) => updateQuote(index, 'attribution', text)}
              maxLength={150}
            />
          </div>
        ))}
      </fieldset>
    </div>
  );
}

export function AboutFieldsEditor({ value, onChange }: { value: AboutFields; onChange: (next: AboutFields) => void }) {
  const materialReady = useMaterialWeb(TEXT_FIELD_LOADERS);

  function updateFocusArea(index: number, field: keyof AboutFields['focusAreas'][number], text: string) {
    const focusAreas = [...value.focusAreas];
    focusAreas[index] = { ...focusAreas[index], [field]: text };
    onChange({ ...value, focusAreas });
  }

  return (
    <div className="space-y-4">
      <MaterialTextField
        ready={materialReady}
        id="about-intro"
        label="Introduction"
        value={value.intro}
        onChange={(intro) => onChange({ ...value, intro })}
        multiline
        rows={3}
        maxLength={2000}
      />
      <MaterialTextField
        ready={materialReady}
        id="about-body"
        label="Body"
        value={value.body}
        onChange={(body) => onChange({ ...value, body })}
        multiline
        rows={5}
        maxLength={4000}
      />
      {value.focusAreas.map((area, index) => (
        <fieldset key={index} className="border border-[var(--line)] p-4 space-y-2">
          <legend className="text-sm font-medium px-1">Focus area {index + 1}</legend>
          <MaterialTextField
            ready={materialReady}
            id={`focus-title-${index}`}
            label="Title"
            value={area.title}
            onChange={(text) => updateFocusArea(index, 'title', text)}
            maxLength={120}
          />
          <MaterialTextField
            ready={materialReady}
            id={`focus-desc-${index}`}
            label="Description"
            value={area.description}
            onChange={(text) => updateFocusArea(index, 'description', text)}
            multiline
            rows={3}
            maxLength={2000}
          />
          <MaterialTextField
            ready={materialReady}
            id={`focus-entity-${index}`}
            label="Entity name"
            value={area.entity}
            onChange={(text) => updateFocusArea(index, 'entity', text)}
            maxLength={200}
          />
          <MaterialTextField
            ready={materialReady}
            id={`focus-abn-${index}`}
            label="ABN"
            value={area.abn}
            onChange={(text) => updateFocusArea(index, 'abn', text)}
            maxLength={40}
          />
        </fieldset>
      ))}
    </div>
  );
}

export function ContactFieldsEditor({
  value,
  onChange,
}: {
  value: ContactFields;
  onChange: (next: ContactFields) => void;
}) {
  const materialReady = useMaterialWeb(TEXT_FIELD_LOADERS);

  return (
    <div className="space-y-4">
      <MaterialTextField
        ready={materialReady}
        id="contact-location"
        label="Location"
        value={value.location}
        onChange={(location) => onChange({ ...value, location })}
        maxLength={200}
      />
      <MaterialTextField
        ready={materialReady}
        id="contact-email"
        label="Email"
        type="email"
        value={value.email}
        onChange={(email) => onChange({ ...value, email })}
        maxLength={200}
      />
    </div>
  );
}
