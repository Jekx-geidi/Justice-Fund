'use client';

import type { HomeFields, AboutFields, ContactFields } from '@/lib/content/types';
import { MediaSlot } from './media/MediaSlot';

export function HomeFieldsEditor({ value, onChange }: { value: HomeFields; onChange: (next: HomeFields) => void }) {
  function updateQuote(index: number, field: 'text' | 'attribution', text: string) {
    const quotes = [...value.quotes];
    quotes[index] = { ...quotes[index], [field]: text };
    onChange({ ...value, quotes });
  }

  return (
    <div className="space-y-4">
      <div className="field">
        <label htmlFor="home-eyebrow">Eyebrow label</label>
        <input
          id="home-eyebrow"
          value={value.eyebrow}
          onChange={(event) => onChange({ ...value, eyebrow: event.target.value })}
          maxLength={80}
        />
      </div>
      <div className="field">
        <label htmlFor="home-mission">Mission statement</label>
        <textarea
          id="home-mission"
          rows={3}
          value={value.mission}
          onChange={(event) => onChange({ ...value, mission: event.target.value })}
          maxLength={2000}
        />
      </div>
      <div className="field">
        <label htmlFor="home-bottom">Bottom identity line</label>
        <input
          id="home-bottom"
          value={value.bottomLine}
          onChange={(event) => onChange({ ...value, bottomLine: event.target.value })}
          maxLength={300}
        />
      </div>
      <div className="field">
        <label>Hero image</label>
        <MediaSlot image={value.heroImage} onChange={(heroImage) => onChange({ ...value, heroImage })} />
      </div>
      <fieldset className="border border-[var(--line)] p-4">
        <legend className="text-sm font-medium px-1">News quotes (placeholder)</legend>
        {value.quotes.map((quote, index) => (
          <div key={index} className="space-y-2 mb-4 last:mb-0">
            <div className="field">
              <label htmlFor={`quote-text-${index}`}>Quote {index + 1}</label>
              <textarea
                id={`quote-text-${index}`}
                rows={2}
                value={quote.text}
                onChange={(event) => updateQuote(index, 'text', event.target.value)}
                maxLength={400}
              />
            </div>
            <div className="field">
              <label htmlFor={`quote-attr-${index}`}>Attribution</label>
              <input
                id={`quote-attr-${index}`}
                value={quote.attribution}
                onChange={(event) => updateQuote(index, 'attribution', event.target.value)}
                maxLength={150}
              />
            </div>
          </div>
        ))}
      </fieldset>
    </div>
  );
}

export function AboutFieldsEditor({ value, onChange }: { value: AboutFields; onChange: (next: AboutFields) => void }) {
  function updateFocusArea(index: number, field: keyof AboutFields['focusAreas'][number], text: string) {
    const focusAreas = [...value.focusAreas];
    focusAreas[index] = { ...focusAreas[index], [field]: text };
    onChange({ ...value, focusAreas });
  }

  return (
    <div className="space-y-4">
      <div className="field">
        <label htmlFor="about-intro">Introduction</label>
        <textarea
          id="about-intro"
          rows={3}
          value={value.intro}
          onChange={(event) => onChange({ ...value, intro: event.target.value })}
          maxLength={2000}
        />
      </div>
      <div className="field">
        <label htmlFor="about-body">Body</label>
        <textarea
          id="about-body"
          rows={5}
          value={value.body}
          onChange={(event) => onChange({ ...value, body: event.target.value })}
          maxLength={4000}
        />
      </div>
      {value.focusAreas.map((area, index) => (
        <fieldset key={index} className="border border-[var(--line)] p-4 space-y-2">
          <legend className="text-sm font-medium px-1">Focus area {index + 1}</legend>
          <div className="field">
            <label htmlFor={`focus-title-${index}`}>Title</label>
            <input
              id={`focus-title-${index}`}
              value={area.title}
              onChange={(event) => updateFocusArea(index, 'title', event.target.value)}
              maxLength={120}
            />
          </div>
          <div className="field">
            <label htmlFor={`focus-desc-${index}`}>Description</label>
            <textarea
              id={`focus-desc-${index}`}
              rows={3}
              value={area.description}
              onChange={(event) => updateFocusArea(index, 'description', event.target.value)}
              maxLength={2000}
            />
          </div>
          <div className="field">
            <label htmlFor={`focus-entity-${index}`}>Entity name</label>
            <input
              id={`focus-entity-${index}`}
              value={area.entity}
              onChange={(event) => updateFocusArea(index, 'entity', event.target.value)}
              maxLength={200}
            />
          </div>
          <div className="field">
            <label htmlFor={`focus-abn-${index}`}>ABN</label>
            <input
              id={`focus-abn-${index}`}
              value={area.abn}
              onChange={(event) => updateFocusArea(index, 'abn', event.target.value)}
              maxLength={40}
            />
          </div>
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
  return (
    <div className="space-y-4">
      <div className="field">
        <label htmlFor="contact-location">Location</label>
        <input
          id="contact-location"
          value={value.location}
          onChange={(event) => onChange({ ...value, location: event.target.value })}
          maxLength={200}
        />
      </div>
      <div className="field">
        <label htmlFor="contact-email">Email</label>
        <input
          id="contact-email"
          type="email"
          value={value.email}
          onChange={(event) => onChange({ ...value, email: event.target.value })}
          maxLength={200}
        />
      </div>
    </div>
  );
}
