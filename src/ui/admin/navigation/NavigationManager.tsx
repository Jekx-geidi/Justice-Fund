'use client';

import { useState } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { NavigationRow, type NavRow } from './NavigationRow';
import { NavigationPreview } from './NavigationPreview';
import { ConfirmDialog } from '../ConfirmDialog';
import { MaterialButton } from '../material/MaterialControls';
import { useMaterialWeb } from '../material/useMaterialWeb';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function NavigationManager({ pages }: { pages: (NavRow & { navLabel: string })[] }) {
  const materialReady = useMaterialWeb([
    () => import('@material/web/button/filled-button.js'),
    () => import('@material/web/button/outlined-button.js'),
  ]);
  const [rows, setRows] = useState(pages);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function announceMove(id: string, newIndex: number, total: number) {
    const row = rows.find((r) => r.id === id);
    if (row) setAnnouncement(`${row.title} moved to position ${newIndex + 1} of ${total}.`);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const next = arrayMove(rows, index, target);
    setRows(next);
    setDirty(true);
    setStatus('idle');
    announceMove(rows[index].id, target, next.length);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = rows.findIndex((row) => row.id === active.id);
    const toIndex = rows.findIndex((row) => row.id === over.id);
    if (fromIndex === -1 || toIndex === -1) return;
    const next = arrayMove(rows, fromIndex, toIndex);
    setRows(next);
    setDirty(true);
    setStatus('idle');
    announceMove(active.id as string, toIndex, next.length);
  }

  function toggleVisible(id: string, visible: boolean) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, showInNavigation: visible } : row)));
    setDirty(true);
    setStatus('idle');
  }

  async function saveNavigation(): Promise<boolean> {
    setStatus('saving');
    setError(null);
    const response = await fetch('/api/admin/pages/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderedIds: rows.map((row) => row.id),
        visibility: Object.fromEntries(rows.map((row) => [row.id, row.showInNavigation])),
      }),
    }).catch(() => null);

    if (!response || !response.ok) {
      setStatus('error');
      setError('Navigation order could not be saved. Your current arrangement is still visible in the editor. Please try again.');
      return false;
    }
    setStatus('saved');
    setDirty(false);
    return true;
  }

  async function handlePublish() {
    setPublishing(true);
    if (dirty) {
      const saved = await saveNavigation();
      if (!saved) {
        setPublishing(false);
        setConfirmPublish(false);
        return;
      }
    }
    await fetch('/api/admin/content/publish', { method: 'POST' }).catch(() => null);
    setPublishing(false);
    setConfirmPublish(false);
  }

  const previewLabels = rows.filter((row) => row.showInNavigation).map((row) => row.navLabel);

  return (
    <div className="bg-white border border-[var(--line)] p-4 mb-8">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg">Navigation</h2>
      </div>
      <p className="text-sm text-[var(--slate)] mb-4">
        Drag pages to reorder how they appear on the website, or use the arrows. Toggle a page&rsquo;s visibility, then
        Save Navigation.
      </p>

      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={rows.map((row) => row.id)} strategy={verticalListSortingStrategy}>
          <ul className="border border-[var(--line)] mb-4">
            {rows.map((row, index) => (
              <NavigationRow key={row.id} row={row} index={index} total={rows.length} onToggleVisible={toggleVisible} onMove={move} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <div className="mb-4">
        <NavigationPreview labels={previewLabels} />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-700 mb-3">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <MaterialButton ready={materialReady} variant="filled" onClick={saveNavigation} disabled={!dirty || status === 'saving'}>
          {status === 'saving' ? 'Saving…' : 'Save Navigation'}
        </MaterialButton>
        <MaterialButton ready={materialReady} variant="outlined" onClick={() => setConfirmPublish(true)}>
          Publish Now
        </MaterialButton>
        {status === 'saved' && <span className="text-sm text-green-700">Saved to draft</span>}
        {dirty && status !== 'saving' && <span className="text-sm text-[var(--slate)]">Unsaved changes</span>}
      </div>

      <ConfirmDialog
        open={confirmPublish}
        title="Publish navigation changes?"
        description="This makes the current draft — including this navigation order and visibility — the live website content."
        confirmLabel={publishing ? 'Publishing…' : 'Publish'}
        onConfirm={handlePublish}
        onCancel={() => setConfirmPublish(false)}
      />
    </div>
  );
}
