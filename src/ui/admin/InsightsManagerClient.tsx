'use client';

import { useState } from 'react';
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import type { InsightEntry } from '@/lib/content/types';
import { PublishBar } from './PublishBar';
import { UnsavedChangesGuard } from './UnsavedChangesGuard';
import { AdminEditorLayout } from './live-preview/AdminEditorLayout';
import { LivePreviewPane } from './live-preview/LivePreviewPane';
import { InsightsPageView } from '@/ui/pages/InsightsPageView';
import { MediaSlot } from './media/MediaSlot';

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

export function InsightsManagerClient({ entries: initial }: { entries: InsightEntry[] }) {
  const [entries, setEntries] = useState(initial);
  const [dirty, setDirty] = useState(false);

  function update(id: string, patch: Partial<InsightEntry>) {
    setEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
    setDirty(true);
  }

  function remove(id: string) {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
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
    setEntries((prev) => [...prev, newEntry(prev.length)]);
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

  const editor = (
    <div>
      <p className="text-sm text-[var(--slate)] mb-6">
        Insights launches blank by design. Entries you publish here appear on the public Insights page in the
        approved card layout.
      </p>

      {entries.length === 0 && (
        <div className="bg-white border border-[var(--line)] p-6 mb-4 text-center">
          <p className="text-sm mb-3">No Insights published yet.</p>
          <button type="button" className="button button-dark" onClick={addEntry}>
            + Add Insight
          </button>
        </div>
      )}

      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div key={entry.id} className="bg-white border border-[var(--line)] p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Entry {index + 1}</p>
              <div className="flex items-center gap-2">
                <button type="button" aria-label="Move up" disabled={index === 0} onClick={() => move(index, -1)} className="disabled:opacity-30">
                  <ArrowUp size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={index === entries.length - 1}
                  onClick={() => move(index, 1)}
                  className="disabled:opacity-30"
                >
                  <ArrowDown size={16} aria-hidden="true" />
                </button>
                <button type="button" aria-label="Remove entry" onClick={() => remove(entry.id)} className="text-red-700">
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <div className="field">
                <label htmlFor={`insight-title-${entry.id}`}>Title</label>
                <input
                  id={`insight-title-${entry.id}`}
                  placeholder="Insights entry title"
                  value={entry.title}
                  onChange={(event) => update(entry.id, { title: event.target.value })}
                  maxLength={200}
                />
              </div>
              <div className="field">
                <label htmlFor={`insight-category-${entry.id}`}>Category</label>
                <input
                  id={`insight-category-${entry.id}`}
                  placeholder="e.g. LITIGATION"
                  value={entry.category ?? ''}
                  onChange={(event) => update(entry.id, { category: event.target.value })}
                  maxLength={60}
                />
              </div>
              <div className="field">
                <label htmlFor={`insight-summary-${entry.id}`}>Summary</label>
                <textarea
                  id={`insight-summary-${entry.id}`}
                  rows={3}
                  value={entry.summary}
                  onChange={(event) => update(entry.id, { summary: event.target.value })}
                  maxLength={2000}
                />
              </div>
              <div className="field">
                <label htmlFor={`insight-status-${entry.id}`}>Status</label>
                <select
                  id={`insight-status-${entry.id}`}
                  value={entry.status}
                  onChange={(event) => update(entry.id, { status: event.target.value as InsightEntry['status'] })}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="unpublished">Unpublished</option>
                </select>
              </div>
              <MediaSlot image={entry.image} onChange={(image) => update(entry.id, { image })} />
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="button button-outline border border-[var(--ink)] text-[var(--ink)] mt-4" onClick={addEntry}>
        + Add entry
      </button>

      <PublishBar onSaveDraft={saveDraft} onPublish={publish} dirty={dirty} previewHref="/insights?preview=1" />
    </div>
  );

  const preview = (
    <LivePreviewPane dirty={dirty} fullPreviewHref="/insights?preview=1" resetKey={JSON.stringify(entries)}>
      <InsightsPageView entries={entries} />
    </LivePreviewPane>
  );

  return (
    <div>
      <UnsavedChangesGuard dirty={dirty} />
      <AdminEditorLayout editor={editor} preview={preview} />
    </div>
  );
}
