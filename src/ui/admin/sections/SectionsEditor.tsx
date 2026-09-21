'use client';

import { useState } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { ContentBlock, PageSection } from '@/lib/content/types';
import { BLOCK_LABELS, newBlock } from '../BlockEditor';
import { SectionRow } from './SectionRow';

/**
 * Add/reorder/hide/duplicate/delete UI for a core page's additionalSections
 * zone — appended after that page's fixed core content, before the footer.
 * Drag-and-drop + keyboard Up/Down reorder, same pattern as NavigationManager.
 */
export function SectionsEditor({ sections, onChange }: { sections: PageSection[]; onChange: (sections: PageSection[]) => void }) {
  const [addType, setAddType] = useState<ContentBlock['type']>('richText');
  const [announcement, setAnnouncement] = useState('');
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function updateSection(id: string, next: PageSection) {
    onChange(sections.map((section) => (section.id === id ? next : section)));
  }

  function removeSection(id: string) {
    onChange(sections.filter((section) => section.id !== id));
  }

  function duplicateSection(id: string) {
    const index = sections.findIndex((section) => section.id === id);
    if (index === -1) return;
    const copy: PageSection = { ...sections[index], id: crypto.randomUUID() };
    const next = [...sections];
    next.splice(index + 1, 0, copy);
    onChange(next);
  }

  function toggleHidden(id: string, hidden: boolean) {
    onChange(sections.map((section) => (section.id === id ? { ...section, hidden } : section)));
  }

  function announceMove(id: string, newIndex: number, total: number) {
    const section = sections.find((s) => s.id === id);
    if (section) setAnnouncement(`${BLOCK_LABELS[section.type]} section moved to position ${newIndex + 1} of ${total}.`);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = arrayMove(sections, index, target);
    onChange(next);
    announceMove(sections[index].id, target, next.length);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = sections.findIndex((section) => section.id === active.id);
    const toIndex = sections.findIndex((section) => section.id === over.id);
    if (fromIndex === -1 || toIndex === -1) return;
    const next = arrayMove(sections, fromIndex, toIndex);
    onChange(next);
    announceMove(active.id as string, toIndex, next.length);
  }

  return (
    <div className="space-y-3">
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {sections.length === 0 && (
        <p className="text-sm text-[var(--slate)]">
          No additional sections yet. Sections you add appear at the end of this page, after the content above and
          before the footer.
        </p>
      )}

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {sections.map((section, index) => (
              <SectionRow
                key={section.id}
                section={section}
                index={index}
                total={sections.length}
                onChange={(next) => updateSection(section.id, next)}
                onMove={move}
                onDuplicate={() => duplicateSection(section.id)}
                onToggleHidden={(hidden) => toggleHidden(section.id, hidden)}
                onRemove={() => removeSection(section.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex items-center gap-2">
        <select value={addType} onChange={(event) => setAddType(event.target.value as ContentBlock['type'])}>
          {Object.entries(BLOCK_LABELS).map(([type, label]) => (
            <option key={type} value={type}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="button button-outline border border-[var(--ink)] text-[var(--ink)]"
          onClick={() => onChange([...sections, newBlock(addType) as PageSection])}
        >
          + Add Section
        </button>
      </div>
    </div>
  );
}
