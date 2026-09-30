'use client';

import { PenLine } from 'lucide-react';
import { DEFAULT_EMAIL_LABEL, DEFAULT_INSIGHTS_TAG, type AboutFields, type ContactFields, type HomeFields, type InsightsFields } from '@/lib/content/types';
import { homeSections } from '@/lib/content/home-sections';
import { SITE_EDITOR_HREF } from '@/lib/design/types';
import { MaterialTextField } from './material/MaterialControls';
import { useMaterialWeb } from './material/useMaterialWeb';

const TEXT_FIELD_LOADERS = [() => import('@material/web/textfield/outlined-text-field.js')];

/**
 * Core page editors expose only what the public page actually renders. Anything the
 * page no longer shows (old hero, quotes, photo, entity/ABN…) stays in the
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

/** The sections under the Home hero (Ange's layout, 30 Sep); the hero text itself lives in Site settings. */
export function HomeSectionsEditor({ value, onChange }: { value: HomeFields; onChange: (next: HomeFields) => void }) {
  const materialReady = useMaterialWeb(TEXT_FIELD_LOADERS);
  const { whatWeDo, why } = homeSections(value);
  const setCard = (index: number, key: 'title' | 'text', text: string) => {
    const cards = whatWeDo.cards.map((card, i) => (i === index ? { ...card, [key]: text } : card));
    onChange({ ...value, whatWeDo: { ...whatWeDo, cards } });
  };

  return (
    <fieldset className="border border-[var(--line)] p-4 space-y-4">
      <legend className="text-sm font-medium px-1">Homepage sections</legend>
      <p className="text-xs text-[var(--slate)] pb-3">Shown under the homepage heading. Leave a heading empty to hide that section.</p>
      <MaterialTextField
        ready={materialReady}
        id="home-what-heading"
        label="What we do: heading"
        value={whatWeDo.heading}
        onChange={(heading) => onChange({ ...value, whatWeDo: { ...whatWeDo, heading } })}
        maxLength={120}
      />
      <MaterialTextField
        ready={materialReady}
        id="home-what-intro"
        label="What we do: introduction"
        value={whatWeDo.intro}
        onChange={(intro) => onChange({ ...value, whatWeDo: { ...whatWeDo, intro } })}
        multiline
        rows={3}
        maxLength={1000}
      />
      {whatWeDo.cards.map((card, index) => (
        <div className="space-y-4" key={index}>
          <MaterialTextField
            ready={materialReady}
            id={`home-card-${index}-title`}
            label={`Card ${index + 1}: title`}
            value={card.title}
            onChange={(text) => setCard(index, 'title', text)}
            maxLength={120}
          />
          <MaterialTextField
            ready={materialReady}
            id={`home-card-${index}-text`}
            label={`Card ${index + 1}: text`}
            value={card.text}
            onChange={(text) => setCard(index, 'text', text)}
            multiline
            rows={3}
            maxLength={1000}
          />
        </div>
      ))}
      <MaterialTextField
        ready={materialReady}
        id="home-why-heading"
        label="Why it matters: heading"
        value={why.heading}
        onChange={(heading) => onChange({ ...value, why: { ...why, heading } })}
        maxLength={120}
      />
      <MaterialTextField
        ready={materialReady}
        id="home-why-body"
        label="Why it matters: text (leave a blank line between paragraphs)"
        value={why.body}
        onChange={(body) => onChange({ ...value, why: { ...why, body } })}
        multiline
        rows={6}
        maxLength={4000}
      />
    </fieldset>
  );
}

export function ContactFieldsEditor({ value, onChange }: { value: ContactFields; onChange: (next: ContactFields) => void }) {
  const materialReady = useMaterialWeb(TEXT_FIELD_LOADERS);

  return (
    <fieldset className="border border-[var(--line)] p-4 space-y-4">
      <legend className="text-sm font-medium px-1">Contact content</legend>
      <p className="text-xs text-[var(--slate)] pb-3">Leave a field empty to hide it on the page.</p>
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
        id="contact-email-label"
        label="Label above email"
        value={value.emailLabel ?? DEFAULT_EMAIL_LABEL}
        onChange={(emailLabel) => onChange({ ...value, emailLabel })}
        maxLength={60}
      />
    </fieldset>
  );
}

export function InsightsFieldsEditor({
  value,
  onChange,
}: {
  value: InsightsFields | undefined;
  onChange: (next: InsightsFields) => void;
}) {
  const materialReady = useMaterialWeb(TEXT_FIELD_LOADERS);
  const fields = { emptyTag: value?.emptyTag ?? DEFAULT_INSIGHTS_TAG, emptyMessage: value?.emptyMessage ?? '' };

  return (
    <fieldset className="border border-[var(--line)] p-4 space-y-4">
      <legend className="text-sm font-medium px-1">Placeholder while no Insights are published</legend>
      <p className="text-xs text-[var(--slate)] pb-3">
        Leave both empty to hide the box. It disappears on its own once an Insight is published.
      </p>
      <MaterialTextField
        ready={materialReady}
        id="insights-empty-tag"
        label="Heading"
        value={fields.emptyTag}
        onChange={(emptyTag) => onChange({ ...fields, emptyTag })}
        maxLength={60}
      />
      <MaterialTextField
        ready={materialReady}
        id="insights-empty-message"
        label="Message"
        value={fields.emptyMessage}
        onChange={(emptyMessage) => onChange({ ...fields, emptyMessage })}
        multiline
        rows={3}
        maxLength={500}
      />
    </fieldset>
  );
}
