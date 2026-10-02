'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Settings, X, Check, RotateCcw } from 'lucide-react';
import {
  ACCENT_COLOURS,
  BACKGROUND_IMAGES,
  DEFAULT_DESIGN,
  FONTS,
  DARK_COLOURS,
  HEADING_COLOURS,
  SITE_PAGES,
  PAGE_COLOURS,
  type SitePage,
  designCss,
  sameDesign,
  fontByName,
  OPEN_EDITOR_PARAM,
  type SiteDesign,
  type TextKey,
} from '@/lib/design/types';
import { buildOfflineSite } from './export-files';
import { COLOUR_THEMES, activeTheme, applyTheme } from '@/lib/design/themes';
import { applyDesignContent } from './apply-design';
import { focusSelector } from './focus-targets';
import { PHOTO_OPTIONS, defaultFrame, pagePhoto, type PhotoFrame } from '@/lib/design/page-photos';
import { SITE_LOGOS } from '@/lib/brand/logo-concepts';
import { LOGO_PREVIEW_EVENT } from '@/ui/Header';

type SaveState = 'saved' | 'saving' | 'error';

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
  applyDesignContent(document, design);
}

const FOCUS_KEY = 'ss-focus-mode';
const PHOTO_TIP = 'Tip: drag the photo on the page to move it. Zoom and Opacity are just below.';

/** The label a control shows in the panel: its field label, slider label, the label above its swatches, or its section. */
function controlLabel(target: Element): string | null {
  const field = target.closest('.ss-field');
  if (field) return field.firstChild?.textContent ?? null;
  const slider = target.closest('.ss-slider');
  if (slider) return slider.querySelector('span')?.firstChild?.textContent ?? null;
  const group = target.closest('.ss-grid, .ss-swatches');
  if (!group) return null;
  const above = group.previousElementSibling;
  if (above?.classList.contains('ss-label')) return above.textContent;
  return group.closest('details')?.querySelector('summary')?.textContent ?? null;
}


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

function Swatches({ colours, current, onPick }: { colours: { name: string; value: string; light?: boolean }[]; current: string; onPick: (v: string) => void }) {
  return (
    <div className="ss-swatches">
      {colours.map((c) => (
        <button
          key={c.value}
          type="button"
          className="ss-swatch"
          data-light={c.light || undefined}
          aria-pressed={current === c.value}
          aria-label={c.name}
          title={c.name}
          style={{ background: c.value }}
          onClick={() => onPick(c.value)}
        >
          {current === c.value && <Check size={16} aria-hidden="true" />}
        </button>
      ))}
    </div>
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
  // Only offer controls that change the page on screen (see the SITE_PAGES flags), so a pick never looks like it did nothing.
  const sitePage = SITE_PAGES.find((p) => p.path === pathname);
  const isHome = sitePage?.id === 'home';
  // About, Insights and Contact are built on the shared PageFrame, the only pages the page layout changes.
  const isFramed = Boolean(sitePage) && !isHome;
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
  // Focus mode: highlight the part of the page a control changes. On unless she switches it off (remembered per browser).
  const [focusMode, setFocusMode] = useState(true);
  const focusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // A short tip at the bottom of the page (Reil, 30 Sep): the page photo can be dragged, zoomed and faded.
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);
  function showToast(text: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(text);
    toastTimer.current = setTimeout(() => setToast(''), 5000);
  }

  useEffect(() => {
    try {
      if (localStorage.getItem(FOCUS_KEY) === 'off') setFocusMode(false);
    } catch {}
  }, []);

  function toggleFocusMode(on: boolean) {
    setFocusMode(on);
    if (!on) clearFocus();
    try {
      localStorage.setItem(FOCUS_KEY, on ? 'on' : 'off');
    } catch {}
  }

  function clearFocus() {
    if (focusTimer.current) clearTimeout(focusTimer.current);
    for (const el of document.querySelectorAll('.ss-focus')) el.classList.remove('ss-focus');
  }

  /** Highlights and scrolls to what the touched control changes. */
  function showFocus(target: EventTarget | null) {
    if (!focusMode || !(target instanceof Element)) return;
    const label = controlLabel(target);
    const selector = label && focusSelector(label);
    if (!selector) return;
    clearFocus();
    const els = [...document.querySelectorAll<HTMLElement>(selector)].filter((el) => !el.closest('#site-settings, .ss-launcher'));
    for (const el of els) el.classList.add('ss-focus');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    els[0]?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    focusTimer.current = setTimeout(clearFocus, 2600);
  }

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
  // A new photo starts from its own best framing.
  const setPhoto = (page: SitePage, id: string) => {
    showToast(PHOTO_TIP);
    update({
      ...draft,
      photos: { ...draft.photos, [page]: id },
      photoFrames: { ...draft.photoFrames, [page]: defaultFrame(pagePhoto(page, id)) },
    });
  };
  const setFrame = (page: SitePage, frame: Partial<PhotoFrame>) =>
    update({ ...latest.current, photoFrames: { ...latest.current.photoFrames, [page]: { ...latest.current.photoFrames[page], ...frame } } });

  // The drag listeners live for the whole time the panel is open, so they call the latest setFrame through a ref.
  const setFrameRef = useRef(setFrame);
  setFrameRef.current = setFrame;

  // While the panel is open, page photos can be dragged to choose which part of the photo shows.
  useEffect(() => {
    if (!open) return;
    // Once a session, on a page with a photo, remind her the photo can be dragged.
    try {
      if (sitePage && !sessionStorage.getItem('ss-photo-tip')) {
        sessionStorage.setItem('ss-photo-tip', '1');
        showToast(PHOTO_TIP);
      }
    } catch {}
    document.documentElement.dataset.photoEdit = '';
    let drag: { page: SitePage; x: number; y: number; zoom: number; startX: number; startY: number; w: number; h: number } | null = null;
    const onDown = (e: PointerEvent) => {
      const img = e.target instanceof Element ? e.target.closest<HTMLImageElement>('img[data-page-photo]') : null;
      if (!img) return;
      e.preventDefault();
      const page = img.dataset.pagePhoto as SitePage;
      const frame = latest.current.photoFrames[page];
      const box = img.getBoundingClientRect();
      drag = { page, x: frame.x, y: frame.y, zoom: frame.zoom / 100, startX: e.clientX, startY: e.clientY, w: box.width, h: box.height };
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      // Dragging right reveals more of the left, so the position moves the other way; zoomed in, it moves more gently.
      const clamp = (v: number) => Math.round(Math.min(100, Math.max(0, v)));
      setFrameRef.current(drag.page, {
        x: clamp(drag.x - ((e.clientX - drag.startX) / drag.w) * 100 / drag.zoom),
        y: clamp(drag.y - ((e.clientY - drag.startY) / drag.h) * 100 / drag.zoom),
      });
    };
    const onUp = () => {
      drag = null;
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    return () => {
      delete document.documentElement.dataset.photoEdit;
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
  }, [open, sitePage]);
  const setPageColour = (page: SitePage, key: 'background' | 'text' | 'title' | 'box', value: string) =>
    update({ ...draft, pageColours: { ...draft.pageColours, [page]: { ...draft.pageColours[page], [key]: value } } });

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

  /** Visitors can't publish, so they download an offline copy of the site with their picks to share for approval. */
  async function exportDesign() {
    setBusy(true);
    try {
      const { filename, blob } = await buildOfflineSite(latest.current, pathname);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(`Saved ${filename} to your downloads. Open it to check your choices, then email it to Ange.`);
    } catch {
      setMessage("Couldn't create the file. Please check your connection and try again.");
    }
    setBusy(false);
  }

  const unpublished = !sameDesign(draft, live);
  const currentTheme = activeTheme(draft);
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
      <p className="ss-toast" role="status" aria-live="polite" hidden={!toast}>
        {toast}
      </p>
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
            <label className="ss-focus-toggle">
              <input type="checkbox" checked={focusMode} onChange={(e) => toggleFocusMode(e.target.checked)} />
              Focus mode <small>(highlight what I’m editing)</small>
            </label>
          </div>
          <button type="button" className="ss-icon" aria-label="Close site settings" onClick={() => setOpen(false)}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="ss-body" onPointerDownCapture={(e) => showFocus(e.target)} onFocusCapture={(e) => showFocus(e.target)}>
                    {/* The current page's photo candidates come first: the image April changes most. */}
          {sitePage && (
            <details open>
              <summary>{sitePage.label} photo</summary>
              <div className="ss-grid ss-grid-3">
                {PHOTO_OPTIONS[sitePage.id].map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    className="ss-thumb"
                    aria-pressed={draft.photos[sitePage.id] === photo.id}
                    aria-label={photo.alt}
                    title={photo.alt}
                    onClick={() => setPhoto(sitePage.id, photo.id)}
                  >
                    <img src={photo.thumb} alt="" />
                  </button>
                ))}
              </div>
              <Slider label="Zoom" value={draft.photoFrames[sitePage.id].zoom} min={100} max={250} unit="%" presets={[['Fit', 100], ['Closer', 130], ['Close', 160], ['Very close', 200]]} onChange={(v) => setFrame(sitePage.id, { zoom: v })} />
              <Slider label="Opacity" value={draft.photoFrames[sitePage.id].opacity} min={20} max={100} unit="%" presets={[['Faint', 40], ['Soft', 60], ['Strong', 80], ['Full', 100]]} onChange={(v) => setFrame(sitePage.id, { opacity: v })} />
              <div className="ss-photo-tools">
                <p className="ss-hint">Drag the photo on the page to move it.</p>
                <button type="button" onClick={() => setFrame(sitePage.id, defaultFrame(pagePhoto(sitePage.id, draft.photos[sitePage.id])))}>
                  Reset photo
                </button>
              </div>
            </details>
          )}

          {/* The site background behind the pages: the desert photos or plain white. */}
          <details>
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
            <p className="ss-label">Or a colour</p>
            <Swatches
              colours={PAGE_COLOURS.filter((c) => c.name !== 'White')}
              current={draft.background.kind === 'colour' ? draft.background.colour : ''}
              onPick={(v) => set('background', { ...draft.background, kind: 'colour', colour: v })}
            />
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
            <Slider label="Headings" value={draft.headingSize} min={80} max={140} unit="%" presets={[['Small', 80], ['Medium', 100], ['Large', 115], ['Extra large', 130]]} onChange={(v) => set('headingSize', v)} />
            <Slider label="Body text" value={draft.bodySize} min={14} max={20} unit="px" presets={[['Small', 15], ['Default', 16], ['Large', 17], ['Extra large', 19]]} onChange={(v) => set('bodySize', v)} />
            <Slider label="Menu" value={draft.menuSize} min={11} max={18} unit="px" presets={[['Small', 12], ['Default', 13], ['Large', 15], ['Extra large', 17]]} onChange={(v) => set('menuSize', v)} />
          </details>

          {sitePage && (
            <details>
              <summary>Colour</summary>
              <p className="ss-label">Colour theme (all pages)</p>
              <div className="ss-grid ss-grid-3">
                {COLOUR_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    className="ss-choice ss-theme"
                    aria-pressed={currentTheme?.id === theme.id}
                    onClick={() => update(applyTheme(draft, theme))}
                  >
                    {/* Header, Home box, this page's boxes, button, footer. */}
                    <span className="ss-theme-strip" aria-hidden="true">
                      {[theme.colours.headerColour, theme.home, theme.boxes[sitePage.id].box, theme.colours.buttonColour, theme.colours.footerColour].map((hex, i) => (
                        <span key={i} style={{ background: hex }} />
                      ))}
                    </span>
                    {theme.name}
                  </button>
                ))}
              </div>
              {/* Always one line, so the colours below don't move when a theme is picked or a colour is changed. */}
              <p className="ss-hint" aria-live="polite">
                {currentTheme ? 'Change any colour below to fine-tune it.' : 'Custom colours. Pick a theme to start again.'}
              </p>
              <p className="ss-label">{sitePage.label} page background</p>
              <Swatches
                colours={PAGE_COLOURS}
                current={draft.pageColours[sitePage.id].background}
                onPick={(v) => setPageColour(sitePage.id, 'background', v)}
              />
              {sitePage.pageText && (
                <>
                  <p className="ss-label">{sitePage.label} page text</p>
                  <Swatches
                    colours={PAGE_COLOURS}
                    current={draft.pageColours[sitePage.id].text}
                    onPick={(v) => setPageColour(sitePage.id, 'text', v)}
                  />
                </>
              )}
              {sitePage.colouredHeading && (
                <>
                  <p className="ss-label">Heading colour</p>
                  <Swatches colours={HEADING_COLOURS} current={draft.headingColour} onPick={(v) => set('headingColour', v)} />
                </>
              )}
              {!isHome && (
                <>
                  <p className="ss-label">{sitePage.label} title box</p>
                  <Swatches colours={DARK_COLOURS} current={draft.pageColours[sitePage.id].title} onPick={(v) => setPageColour(sitePage.id, 'title', v)} />
                  <p className="ss-label">{sitePage.label} boxes</p>
                  <Swatches colours={DARK_COLOURS} current={draft.pageColours[sitePage.id].box} onPick={(v) => setPageColour(sitePage.id, 'box', v)} />
                </>
              )}
              <p className="ss-label">Header (all pages)</p>
              <Swatches colours={PAGE_COLOURS} current={draft.headerColour} onPick={(v) => set('headerColour', v)} />
              <p className="ss-label">Footer (all pages)</p>
              <Swatches colours={DARK_COLOURS} current={draft.footerColour} onPick={(v) => set('footerColour', v)} />
              <p className="ss-label">Hover colour (all pages)</p>
              <Swatches colours={DARK_COLOURS} current={draft.hoverColour} onPick={(v) => set('hoverColour', v)} />
              <p className="ss-label">Accent lines (all pages)</p>
              <Swatches colours={ACCENT_COLOURS} current={draft.accentColour} onPick={(v) => set('accentColour', v)} />
              {isHome && (
                <>
                  {/* Only the Get Involved button; its text stays white, so every option is dark enough for it. */}
                  <p className="ss-label">Get Involved button</p>
                  <Swatches colours={DARK_COLOURS} current={draft.buttonColour} onPick={(v) => set('buttonColour', v)} />
                </>
              )}
            </details>
          )}

          <details>
            <summary>Header</summary>
            <label className="ss-label">
              <input type="checkbox" role="switch" checked={draft.stickyHeader} onChange={(e) => set('stickyHeader', e.target.checked)} aria-describedby="sticky-header-help" />{' '}
              Stick to place header
            </label>
            <p id="sticky-header-help">Keep the header visible while scrolling. Turn off to let it scroll with the page.</p>
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
            {isHome && (
              <>
                <label className="ss-field">
                  Homepage heading
                  <input value={draft.text.homeHeading} maxLength={120} onChange={(e) => setText('homeHeading', e.target.value)} />
                </label>
                <label className="ss-field">
                  Homepage tagline <small>(optional)</small>
                  <input value={draft.text.homeTagline} maxLength={240} onChange={(e) => setText('homeTagline', e.target.value)} />
                </label>
              </>
            )}
            {sitePage?.id === 'contact' && (
              <label className="ss-field">
                Contact email
                <input type="email" value={draft.text.contactEmail} maxLength={200} onChange={(e) => setText('contactEmail', e.target.value)} />
              </label>
            )}
            <label className="ss-field">
              ABN
              <input inputMode="numeric" value={draft.text.abn} maxLength={20} onChange={(e) => setText('abn', e.target.value)} />
            </label>
          </details>

          {/* Nothing on the page changes, so only admins, whose saves reach Google, get these. */}
          {canSave && (
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
          )}
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
              <button type="button" className="ss-publish" disabled={busy} onClick={() => void exportDesign()}>
                {busy ? 'Preparing…' : 'Export design'}
              </button>
            </div>
          )}
          {!canSave && (
            <p className="ss-hint">Saves an offline copy of the site with your choices. Open it in any browser, or email it to Ange for approval.</p>
          )}
          <button type="button" className="ss-restore" disabled={busy} onClick={restoreDefaults}>
            <RotateCcw size={13} aria-hidden="true" /> Restore original design
          </button>
        </div>
      </aside>
    </>
  );
}
