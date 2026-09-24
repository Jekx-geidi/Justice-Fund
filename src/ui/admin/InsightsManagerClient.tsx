'use client';

import { useState } from 'react';
import { ArrowUp, ArrowDown, ChevronDown, Plus, Trash2 } from 'lucide-react';
import type { InsightEntry } from '@/lib/content/types';
import { PublishBar } from './PublishBar';
import { UnsavedChangesGuard } from './UnsavedChangesGuard';
import { ConfirmDialog } from './ConfirmDialog';
import { StatusBadge } from './StatusBadge';
import { AdminEditorLayout } from './live-preview/AdminEditorLayout';
import { LivePreviewPane } from './live-preview/LivePreviewPane';
import { SitePreviewShell, type SitePreviewContext } from './live-preview/SitePreviewShell';
import { InsightsPageView } from '@/ui/pages/InsightsPageView';

function newEntry(order: number): InsightEntry {
  return {
    id: crypto.randomUUID(),
    title: '',
    category: '',
    summary: '',
    status: 'draft',
    order,
  };
}

const entryLabel = (entry: InsightEntry) => entry.title.trim() || 'New insight entry';

/**
 * Only the fields the public Insights card renders (category, title, summary, date) plus status.
 * The public card has no image, so an entry's stored image, if any, is kept but not offered here.
 */
function EntryFields({ entry, onChange }: { entry: InsightEntry; onChange: (patch: Partial<InsightEntry>) => void }) {
  const id = (name: string) => `insight-${name}-${entry.id}`;
  return (
    <div className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-xs font-medium uppercase tracking-[.12em] text-[var(--slate)] mb-2">Content</legend>
        <div className="field">
          <label htmlFor={id('title')}>Title</label>
          <input id={id('title')} placeholder="e.g. Climate case filed in the Federal Court" value={entry.title} onChange={(e) => onChange({ title: e.target.value })} maxLength={200} />
        </div>
        <div className="field">
          <label htmlFor={id('category')}>Category label</label>
          <input id={id('category')} placeholder="e.g. Litigation" value={entry.category ?? ''} onChange={(e) => onChange({ category: e.target.value })} maxLength={60} />
          <p className="text-xs text-[var(--slate)]">Shown in small capitals above the title.</p>
        </div>
        <div className="field">
          <label htmlFor={id('summary')}>Summary</label>
          <textarea id={id('summary')} rows={4} value={entry.summary} onChange={(e) => onChange({ summary: e.target.value })} maxLength={2000} />
        </div>
        <div className="field">
          <label htmlFor={id('date')}>
            Date <span className="text-[var(--slate)] font-normal">(optional)</span>
          </label>
          <input id={id('date')} placeholder="e.g. March 2026" value={entry.date ?? ''} onChange={(e) => onChange({ date: e.target.value })} maxLength={40} />
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs font-medium uppercase tracking-[.12em] text-[var(--slate)] mb-2">Publishing</legend>
        <div className="field">
          <label htmlFor={id('status')}>Status</label>
          <select id={id('status')} value={entry.status} onChange={(e) => onChange({ status: e.target.value as InsightEntry['status'] })}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
          </select>
          <p className="text-xs text-[var(--slate)]">Only published entries appear on the public Insights page, once you publish the site.</p>
        </div>
      </fieldset>
    </div>
  );
}

export function InsightsManagerClient({ entries: initial, site }: { entries: InsightEntry[]; site: SitePreviewContext }) {
  const [entries, setEntries] = useState(initial);
  const [dirty, setDirty] = useState(false);
  // One open at a time keeps the list scannable; a new entry opens straight away.
  const [openId, setOpenId] = useState<string | null>(initial.length === 1 ? initial[0].id : null);
  const [deleting, setDeleting] = useState<InsightEntry | null>(null);

  function update(id: string, patch: Partial<InsightEntry>) {
    setEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
    setDirty(true);
  }

  function remove(id: string) {
    setEntries((prev) => prev.filter((entry) => entry.id !== id).map((entry, i) => ({ ...entry, order: i })));
    setDirty(true);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= entries.length) return;
    const next = [...entries];
    [next[index], next[target]] = [next[target], next[index]];
    setEntries(next.map((entry, i) => ({ ...entry, order: i })));
    setDirty(true);
  }

  function addEntry() {
    const entry = newEntry(entries.length);
    setEntries((prev) => [...prev, entry]);
    setOpenId(entry.id);
    setDirty(true);
  }

  async function saveDraft(): Promise<{ ok: boolean; error?: string }> {
    const response = await fetch('/api/admin/content/draft', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pages: [], insights: entries }),
    }).catch(() => null);

    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      return { ok: false, error: body?.error ?? 'Save failed.' };
    }
    setDirty(false);
    return { ok: true };
  }

  async function publish(): Promise<{ ok: boolean; error?: string }> {
    const response = await fetch('/api/admin/content/publish', { method: 'POST' }).catch(() => null);
    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      return { ok: false, error: body?.error };
    }
    return { ok: true };
  }

  const addButton = (
    <button type="button" className="button button-dark inline-flex items-center gap-1.5" onClick={addEntry}>
      <Plus size={16} aria-hidden="true" /> Add Entry
    </button>
  );

  const editor = (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow">INSIGHTS</p>
          <h1 className="text-3xl mt-2 mb-1">Insights</h1>
          <p className="text-sm text-[var(--slate)] max-w-[46ch]">
            Manage the entries that appear on the public Insights page. Each entry shows there as a dark card, in the order below.
          </p>
        </div>
        {entries.length > 0 && addButton}
      </div>

      {entries.length === 0 ? (
        <div className="bg-white border border-dashed border-[var(--line)] px-6 py-12 text-center">
          <p className="font-medium">No insights entries yet.</p>
          <p className="text-sm text-[var(--slate)] mt-1 mb-5">Add your first entry to begin. Until then the public page shows &ldquo;Coming soon&rdquo;.</p>
          {addButton}
        </div>
      ) : (
        <ol className="space-y-3">
          {entries.map((entry, index) => {
            const open = openId === entry.id;
            const panelId = `insight-panel-${entry.id}`;
            return (
              <li key={entry.id} className={`bg-white border ${open ? 'border-[var(--ink)]' : 'border-[var(--line)]'}`}>
                <div className="flex items-center gap-2 p-3 pl-4">
                  <button
                    type="button"
                    className="flex-1 min-w-0 flex items-center gap-3 text-left min-h-[44px]"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenId(open ? null : entry.id)}
                  >
                    <ChevronDown size={18} aria-hidden="true" className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                    <span className="min-w-0">
                      {entry.category && <span className="block text-[11px] uppercase tracking-[.12em] text-[var(--slate)] truncate">{entry.category}</span>}
                      <span className={`block truncate font-medium ${entry.title.trim() ? '' : 'text-[var(--slate)] italic'}`}>{entryLabel(entry)}</span>
                    </span>
                  </button>
                  <StatusBadge status={entry.status} />
                  <div className="flex items-center">
                    <button type="button" className="grid place-items-center w-10 h-10 hover:bg-[var(--paper)] disabled:opacity-30" aria-label={`Move "${entryLabel(entry)}" up`} disabled={index === 0} onClick={() => move(index, -1)}>
                      <ArrowUp size={16} aria-hidden="true" />
                    </button>
                    <button type="button" className="grid place-items-center w-10 h-10 hover:bg-[var(--paper)] disabled:opacity-30" aria-label={`Move "${entryLabel(entry)}" down`} disabled={index === entries.length - 1} onClick={() => move(index, 1)}>
                      <ArrowDown size={16} aria-hidden="true" />
                    </button>
                    <button type="button" className="grid place-items-center w-10 h-10 text-[var(--slate)] hover:text-red-700 hover:bg-red-50" aria-label={`Delete "${entryLabel(entry)}"`} onClick={() => setDeleting(entry)}>
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div id={panelId} hidden={!open} className="border-t border-[var(--line)] p-4">
                  <EntryFields entry={entry} onChange={(patch) => update(entry.id, patch)} />
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <PublishBar onSaveDraft={saveDraft} onPublish={publish} dirty={dirty} previewHref="/insights?preview=1" />
    </div>
  );

  const preview = (
    <LivePreviewPane dirty={dirty} fullPreviewHref="/insights?preview=1" resetKey={JSON.stringify(entries)}>
      <SitePreviewShell site={site}>
        <InsightsPageView entries={entries} />
      </SitePreviewShell>
    </LivePreviewPane>
  );

  return (
    <div>
      <UnsavedChangesGuard dirty={dirty} />
      <AdminEditorLayout editor={editor} preview={preview} widePreview />
      <ConfirmDialog
        open={deleting !== null}
        title={deleting ? `Delete "${entryLabel(deleting)}"?` : ''}
        description="The entry is removed from the draft. It stays on the public page until you save and publish."
        confirmLabel="Delete entry"
        onConfirm={() => {
          if (deleting) remove(deleting.id);
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
