'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ArrowUp, ArrowDown, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import type { PageSection, ContentBlock } from '@/lib/content/types';
import { BLOCK_LABELS, BlockFields } from '../BlockEditor';
import { ConfirmDialog } from '../ConfirmDialog';

export function SectionRow({
  section,
  index,
  total,
  onChange,
  onMove,
  onDuplicate,
  onToggleHidden,
  onRemove,
}: {
  section: PageSection;
  index: number;
  total: number;
  onChange: (next: PageSection) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onDuplicate: () => void;
  onToggleHidden: (hidden: boolean) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const style = { transform: CSS.Transform.toString(transform), transition };

  function handleFieldsChange(next: ContentBlock) {
    onChange({ ...next, hidden: section.hidden });
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-[var(--line)] p-4 ${isDragging ? 'opacity-60' : ''} ${section.hidden ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`Drag to reorder ${BLOCK_LABELS[section.type]} section`}
            className="p-1 text-[var(--slate)] cursor-grab touch-none shrink-0"
          >
            <GripVertical size={16} aria-hidden="true" />
          </button>
          <p className="text-sm font-medium truncate">
            {BLOCK_LABELS[section.type]}
            {section.hidden && <span className="text-xs text-[var(--slate)] ml-2">Hidden</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" aria-label="Move section up" disabled={index === 0} onClick={() => onMove(index, -1)} className="disabled:opacity-30">
            <ArrowUp size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Move section down"
            disabled={index === total - 1}
            onClick={() => onMove(index, 1)}
            className="disabled:opacity-30"
          >
            <ArrowDown size={16} aria-hidden="true" />
          </button>
          <button type="button" aria-label={section.hidden ? 'Show section' : 'Hide section'} onClick={() => onToggleHidden(!section.hidden)}>
            {section.hidden ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
          </button>
          <button type="button" aria-label="Duplicate section" onClick={onDuplicate}>
            <Copy size={16} aria-hidden="true" />
          </button>
          <button type="button" aria-label="Delete section" onClick={() => setConfirmingDelete(true)} className="text-red-700">
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <BlockFields block={section} onChange={handleFieldsChange} />

      <ConfirmDialog
        open={confirmingDelete}
        title={`Delete this ${BLOCK_LABELS[section.type].toLowerCase()} section?`}
        description="This section will be removed from the draft. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          setConfirmingDelete(false);
          onRemove();
        }}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
