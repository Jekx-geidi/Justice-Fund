'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Settings, X, Check, RotateCcw } from 'lucide-react';
import {
  BACKGROUND_IMAGES,
  DEFAULT_DESIGN,
  FONTS,
  HEADING_COLOURS,
  designCss,
  fontByName,
  OPEN_EDITOR_PARAM,
  type SiteDesign,
} from '@/lib/design/types';
import { SITE_LOGOS } from '@/lib/brand/logo-concepts';
import { LOGO_PREVIEW_EVENT } from '@/ui/Header';

/** Pages built on the shared PageFrame, the only ones the page layout changes. */
const FRAMED_PAGES = ['/about', '/insights', '/contact'];

type SaveState = 'saved' | 'saving' | 'error';
type TextKey = keyof SiteDesign['text'];

/** Pushes a settings object onto the live page so every change shows immediately. */
function applyToPage(design: SiteDesign) {
  const style = document.getElementById('site-design-css');
  if (style) style.textContent = designCss(design);
  const shell = document.querySelector<HTMLElement>('.site-shell');
  if (shell) {
    shell.dataset.homeLayout = design.homeLayout;
    shell.dataset.pageLayout = design.pageLayout;
    shell.dataset.headerStyle = design.headerStyle;
  }
  window.dispatchEvent(new CustomEvent(LOGO_PREVIEW_EVENT, { detail: design.logo }));
  for (const el of document.querySelectorAll<HTMLElement>('[data-design-text]')) {
    const key = el.dataset.designText as TextKey;
    const value = design.text[key] ?? '';
    el.textContent = value;
    if (key === 'homeTagline') el.hidden = !value;
    if (el.hasAttribute('data-design-mailto')) el.setAttribute('href', `mailto:${value}`);
  }
}

const same = (a: SiteDesign, b: SiteDesign) => JSON.stringify(a) === JSON.stringify(b);

function Choice<T extends string>({
  value,
  current,
  onPick,
  children,
  label,
}: {
  value: T;
  current: T;
  onPick: (v: T) => void;
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <button type="button" className="ss-choice" aria-pressed={value === current} aria-label={label} onClick={() => onPick(value)}>
      {children}
    </button>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  unit,
  presets,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  /** One-tap sizes (Small / Default / Large / Extra large); the slider stays for fine-tuning. */
  presets: [string, number][];
  onChange: (v: number) => void;
}) {
  return (
    <div className="ss-slider">
      <span>
        {label} <output>{value}{unit}</output>
      </span>
      <div className="ss-presets" role="group" aria-label={`${label} size`}>
        {presets.map(([name, size]) => (
          <button key={name} type="button" aria-pressed={value === size} onClick={() => onChange(size)}>
            {name}
          </button>
        ))}
      </div>
      <input
        type="range"
        aria-label={`${label} size, fine adjustment`}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function SiteSettingsPanel({
  initialDraft,
  live: initialLive,
  canSave,
}: {
  initialDraft: SiteDesign;
  live: SiteDesign;
  /** False for visitors: changes preview on their own screen only and are never sent to the server. */
  canSave: boolean;
}) {
  const pathname = usePathname() ?? '';
  // Only offer the layout that changes the page on screen, so a pick never looks like it did nothing.
  const isHome = pathname === '/';
  const isFramed = FRAMED_PAGES.includes(pathname);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(initialDraft);
  const [live, setLive] = useState(initialLive);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(draft);
  // Saves run one after another, so the last change always wins and Publish can wait for them.
  const inflight = useRef<Promise<boolean>>(Promise.resolve(true));
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(OPEN_EDITOR_PARAM)) return;
    setOpen(true);
    url.searchParams.delete(OPEN_EDITOR_PARAM);
    window.history.replaceState(null, '', url);
  }, []);

  // Load every font once so the font buttons can show each name in its own typeface.
  useEffect(() => {
    if (!open || document.getElementById('ss-font-previews')) return;
    const link = document.createElement('link');
    link.id = 'ss-font-previews';
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${FONTS.filter((f) => f.google)
      .map((f) => `family=${f.google}`)
      .join('&')}&display=swap`;
    document.head.appendChild(link);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function save(next: SiteDesign) {
    const run = inflight.current.then(() => doSave(next));
    inflight.current = run;
    return run;
  }

  async function doSave(next: SiteDesign) {
    setSaveState('saving');
    const res = await fetch('/api/admin/design', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    }).catch(() => null);
    if (res?.ok) {
      setSaveState('saved');
      setMessage('');
      return true;
    }
    const body = await res?.json().catch(() => null);
    setSaveState('error');
    setMessage(body?.error ?? "Couldn't save. Check your connection and try again.");
    return false;
  }

  function update(next: SiteDesign) {
    setDraft(next);
    latest.current = next;
    applyToPage(next);
    if (!canSave) return;
    setSaveState('saving');
    if (pending.current) clearTimeout(pending.current);
    pending.current = setTimeout(() => void save(latest.current), 600);
  }

  const set = <K extends keyof SiteDesign>(key: K, value: SiteDesign[K]) => update({ ...draft, [key]: value });
  const setText = (key: TextKey, value: string) => update({ ...draft, text: { ...draft.text, [key]: value } });
  const setSeo = (key: keyof SiteDesign['seo'], value: string) => update({ ...draft, seo: { ...draft.seo, [key]: value } });

  async function flush() {
    if (pending.current) {
      clearTimeout(pending.current);
      pending.current = null;
      return save(latest.current);
    }
    return inflight.current;
  }

  async function publish() {
    setBusy(true);
    if (await flush()) {
      const res = await fetch('/api/admin/design/publish', { method: 'POST' }).catch(() => null);
      if (res?.ok) {
        setLive(latest.current);
        setMessage('Published. Visitors now see these changes.');
      } else {
        setMessage("Couldn't publish. Your changes are still saved; please try again.");
      }
    }
    setBusy(false);
  }

  async function reset() {
    if (!window.confirm('Undo all changes you have not published yet?')) return;
    setBusy(true);
    if (pending.current) clearTimeout(pending.current);
    pending.current = null;
    await inflight.current;
    const res = await fetch('/api/admin/design/reset', { method: 'POST' }).catch(() => null);
    const body = await res?.json().catch(() => null);
    if (res?.ok && body?.design) {
      setDraft(body.design);
      latest.current = body.design;
      applyToPage(body.design);
      setSaveState('saved');
      setMessage('Unpublished changes undone.');
    } else {
      setMessage("Couldn't undo changes. Please try again.");
    }
    setBusy(false);
  }

  /** Puts the look back to the original design. Text and search settings are kept, and nothing goes live until Publish. */
  function restoreDefaults() {
    if (!window.confirm('Put the background, layout, fonts, sizes, colour, header and logo back to the original design? Your text and search settings stay as they are. Nothing changes for visitors until you publish.')) return;
    update({ ...DEFAULT_DESIGN, background: { ...DEFAULT_DESIGN.background, customUrl: draft.background.customUrl }, text: draft.text, seo: draft.seo });
    setMessage(canSave ? 'Original design restored. Publish to make it live.' : 'Original design shown.');
  }

  /** Visitors' "undo": back to the published look, on their screen only. */
  function undoPreview() {
    setDraft(live);
    latest.current = live;
    applyToPage(live);
    setMessage('');
  }

  const unpublished = !same(draft, live);
  const status = !canSave
    ? 'Preview only. Changes show on your screen and are not saved.'
    : saveState === 'saving'
      ? 'Saving…'
      : saveState === 'error'
        ? 'Not saved'
        : unpublished
          ? 'Unpublished changes'
          : 'Everything is published';

  return (
    <>
      <button
        type="button"
        className="ss-launcher"
        aria-label={unpublished ? 'Site settings (unpublished changes)' : 'Site settings'}
        title="Site settings"
        aria-expanded={open}
        aria-controls="site-settings"
        onClick={() => setOpen(true)}
      >
        <Settings size={22} aria-hidden="true" />
        {unpublished && <span className="ss-dot" aria-hidden="true" />}
      </button>

      <aside
        id="site-settings"
        ref={panelRef}
        className="ss-panel"
        data-open={open}
        aria-label="Site settings"
        aria-hidden={!open}
        inert={!open}
        tabIndex={-1}
      >
        <div className="ss-head">
          <div>
            <h2>Site settings</h2>
            <p className={`ss-status ss-status-${saveState}`} role="status">
              {status}
            </p>
          </div>
          <button type="button" className="ss-icon" aria-label="Close site settings" onClick={() => setOpen(false)}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="ss-body">
          <details open>
            <summary>Background</summary>
            <div className="ss-grid ss-grid-3">
              {BACKGROUND_IMAGES.map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  className="ss-thumb"
                  aria-pressed={draft.background.kind === 'image' && draft.background.imageId === bg.id}
                  onClick={() => set('background', { ...draft.background, kind: 'image', imageId: bg.id })}
                >
                  <img src={bg.thumb} alt="" />
                  <span>{bg.label}</span>
                </button>
              ))}
              <button
                type="button"
                className="ss-thumb"
                aria-pressed={draft.background.kind === 'white'}
                onClick={() => set('background', { ...draft.background, kind: 'white' })}
              >
                <span className="ss-swatch-white" />
                <span>Plain white</span>
              </button>
            </div>
          </details>

          <details>
            <summary>Layout</summary>
            {isHome && (
              <>
                <p className="ss-label">Homepage</p>
                <div className="ss-grid ss-grid-3">
                  {(
                    [
                      ['centred', 'Centred box'],
                      ['split', 'Split'],
                      ['band', 'Bottom band'],
                    ] as const
                  ).map(([value, label]) => (
                    <Choice key={value} value={value} current={draft.homeLayout} onPick={(v) => set('homeLayout', v)}>
                      <span className={`ss-mini ss-mini-home-${value}`} aria-hidden="true">
                        <i />
                      </span>
                      {label}
                    </Choice>
                  ))}
                </div>
              </>
            )}
            {isFramed && (
              <>
                <p className="ss-label">About, Insights and Contact</p>
                <div className="ss-grid ss-grid-3">
                  {(
                    [
                      ['stacked', 'Stacked'],
                      ['side', 'Heading on side'],
                      ['centred', 'Centred'],
                    ] as const
                  ).map(([value, label]) => (
                    <Choice key={value} value={value} current={draft.pageLayout} onPick={(v) => set('pageLayout', v)}>
                      <span className={`ss-mini ss-mini-page-${value}`} aria-hidden="true">
                        <i />
                        <b />
                      </span>
                      {label}
                    </Choice>
                  ))}
                </div>
              </>
            )}
            {!isHome && !isFramed && (
              <p className="ss-hint">Layout options show on Home, About, Insights and Contact.</p>
            )}
          </details>

          <details>
            <summary>Fonts</summary>
            <p className="ss-label">Headings</p>
            <div className="ss-grid ss-grid-2">
              {FONTS.map((f) => (
                <Choice key={f.name} value={f.name} current={draft.headingFont} onPick={(v) => set('headingFont', v)}>
                  <span style={{ fontFamily: fontByName(f.name).stack, fontWeight: 600 }}>{f.name}</span>
                </Choice>
              ))}
            </div>
            <p className="ss-label">Body text</p>
            <div className="ss-grid ss-grid-2">
              {FONTS.map((f) => (
                <Choice key={f.name} value={f.name} current={draft.bodyFont} onPick={(v) => set('bodyFont', v)}>
                  <span style={{ fontFamily: fontByName(f.name).stack }}>{f.name}</span>
                </Choice>
              ))}
            </div>
          </details>

          <details>
            <summary>Sizes</summary>
            <Slider label="Headings" value={draft.headingSize} min={80} max={140} unit="%" presets={[['Small', 90], ['Default', 100], ['Large', 115], ['Extra large', 130]]} onChange={(v) => set('headingSize', v)} />
            <Slider label="Body text" value={draft.bodySize} min={14} max={20} unit="px" presets={[['Small', 15], ['Default', 16], ['Large', 17], ['Extra large', 19]]} onChange={(v) => set('bodySize', v)} />
            <Slider label="Menu" value={draft.menuSize} min={11} max={18} unit="px" presets={[['Small', 12], ['Default', 13], ['Large', 15], ['Extra large', 17]]} onChange={(v) => set('menuSize', v)} />
          </details>

          <details>
            <summary>Colour</summary>
            <p className="ss-label">Heading colour</p>
            <div className="ss-swatches">
              {HEADING_COLOURS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className="ss-swatch"
                  aria-pressed={draft.headingColour === c.value}
                  aria-label={c.name}
                  title={c.name}
                  style={{ background: c.value }}
                  onClick={() => set('headingColour', c.value)}
                >
                  {draft.headingColour === c.value && <Check size={16} aria-hidden="true" />}
                </button>
              ))}
            </div>
          </details>

          <details>
            <summary>Header</summary>
            <div className="ss-grid ss-grid-2">
              <Choice value="split" current={draft.headerStyle} onPick={(v) => set('headerStyle', v)}>
                <span className="ss-mini ss-mini-header-split" aria-hidden="true">
                  <i />
                  <b />
                </span>
                Name left, menu right
              </Choice>
              <Choice value="centred" current={draft.headerStyle} onPick={(v) => set('headerStyle', v)}>
                <span className="ss-mini ss-mini-header-centred" aria-hidden="true">
                  <i />
                  <b />
                </span>
                Everything centred
              </Choice>
            </div>
            <p className="ss-label">Logo</p>
            <div className="ss-grid ss-grid-3">
              <Choice value="" current={draft.logo} onPick={(v) => set('logo', v)}>
                Name only
              </Choice>
              {SITE_LOGOS.map((c) => (
                <Choice key={c.id} value={c.id} current={draft.logo} onPick={(v) => set('logo', v)} label={`${c.name} logo`}>
                  <img className="ss-logo" src={c.thumb} alt="" />
                </Choice>
              ))}
            </div>
          </details>

          <details>
            <summary>Text</summary>
            <label className="ss-field">
              Homepage heading
              <input value={draft.text.homeHeading} maxLength={120} onChange={(e) => setText('homeHeading', e.target.value)} />
            </label>
            <label className="ss-field">
              Homepage tagline <small>(optional)</small>
              <input value={draft.text.homeTagline} maxLength={240} onChange={(e) => setText('homeTagline', e.target.value)} />
            </label>
            <label className="ss-field">
              Contact email
              <input type="email" value={draft.text.contactEmail} maxLength={200} onChange={(e) => setText('contactEmail', e.target.value)} />
            </label>
            <label className="ss-field">
              ABN
              <input inputMode="numeric" value={draft.text.abn} maxLength={20} onChange={(e) => setText('abn', e.target.value)} />
            </label>
          </details>

          <details>
            <summary>Search (SEO)</summary>
            <p className="ss-hint">How the site appears in Google results.</p>
            <label className="ss-field">
              Page title
              <input value={draft.seo.title} maxLength={70} onChange={(e) => setSeo('title', e.target.value)} />
            </label>
            <label className="ss-field">
              Description
              <textarea rows={3} value={draft.seo.description} maxLength={300} onChange={(e) => setSeo('description', e.target.value)} />
            </label>
            <label className="ss-field">
              Keywords <small>(separate with commas)</small>
              <textarea rows={2} value={draft.seo.keywords} maxLength={300} onChange={(e) => setSeo('keywords', e.target.value)} />
            </label>
          </details>
        </div>

        <div className="ss-foot">
          {message && (
            <p className="ss-message" role="alert">
              {message}
            </p>
          )}
          {canSave ? (
            <div className="ss-actions">
              <button type="button" className="ss-reset" disabled={busy || !unpublished} onClick={() => void reset()}>
                Reset
              </button>
              <button type="button" className="ss-publish" disabled={busy || !unpublished || saveState === 'error'} onClick={() => void publish()}>
                {busy ? 'Working…' : 'Publish'}
              </button>
            </div>
          ) : (
            <div className="ss-actions">
              <button type="button" className="ss-reset" disabled={!unpublished} onClick={undoPreview}>
                Undo
              </button>
              <a className="ss-publish ss-login" href="/admin/login">
                Log in to publish
              </a>
            </div>
          )}
          <button type="button" className="ss-restore" disabled={busy} onClick={restoreDefaults}>
            <RotateCcw size={13} aria-hidden="true" /> Restore original design
          </button>
        </div>
      </aside>
    </>
  );
}
