'use client';

import { useState } from 'react';
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import type { ContentBlock } from '@/lib/content/types';
import { MediaSlot } from './media/MediaSlot';

const BLOCK_LABELS: Record<ContentBlock['type'], string> = {
  hero: 'Hero',
  richText: 'Rich text',
  imageText: 'Image + text',
  cardGrid: 'Cards',
  quote: 'Quote',
  cta: 'Call to action',
};

function newBlock(type: ContentBlock['type']): ContentBlock {
  const id = crypto.randomUUID();
  switch (type) {
    case 'hero':
      return { id, type, heading: 'New heading', alignment: 'left' };
    case 'richText':
      return { id, type, body: '<p>Write something…</p>' };
    case 'imageText':
      return { id, type, heading: 'New heading', body: '', imageSide: 'left' };
    case 'cardGrid':
      return { id, type, cards: [] };
    case 'quote':
      return { id, type, quote: 'Quote text' };
    case 'cta':
      return { id, type, heading: 'Take action' };
  }
}

function BlockFields({ block, onChange }: { block: ContentBlock; onChange: (next: ContentBlock) => void }) {
  switch (block.type) {
    case 'hero':
      return (
        <div className="space-y-2">
          <input
            placeholder="Eyebrow (optional)"
            value={block.eyebrow ?? ''}
            onChange={(event) => onChange({ ...block, eyebrow: event.target.value })}
          />
          <input placeholder="Heading" value={block.heading} onChange={(event) => onChange({ ...block, heading: event.target.value })} />
          <textarea
            placeholder="Body (optional)"
            rows={2}
            value={block.body ?? ''}
            onChange={(event) => onChange({ ...block, body: event.target.value })}
          />
          <MediaSlot image={block.image} onChange={(image) => onChange({ ...block, image })} />
        </div>
      );
    case 'richText':
      return (
        <div className="space-y-2">
          <input
            placeholder="Heading (optional)"
            value={block.heading ?? ''}
            onChange={(event) => onChange({ ...block, heading: event.target.value })}
          />
          <textarea
            placeholder="Body HTML — paragraphs, bold, italic, links, lists"
            rows={5}
            value={block.body}
            onChange={(event) => onChange({ ...block, body: event.target.value })}
          />
        </div>
      );
    case 'imageText':
      return (
        <div className="space-y-2">
          <input placeholder="Heading" value={block.heading} onChange={(event) => onChange({ ...block, heading: event.target.value })} />
          <textarea
            placeholder="Body"
            rows={3}
            value={block.body}
            onChange={(event) => onChange({ ...block, body: event.target.value })}
          />
          <MediaSlot image={block.image} onChange={(image) => onChange({ ...block, image })} />
          <select value={block.imageSide} onChange={(event) => onChange({ ...block, imageSide: event.target.value as 'left' | 'right' })}>
            <option value="left">Image on left</option>
            <option value="right">Image on right</option>
          </select>
        </div>
      );
    case 'cardGrid':
      return (
        <div className="space-y-2">
          <input
            placeholder="Section heading (optional)"
            value={block.heading ?? ''}
            onChange={(event) => onChange({ ...block, heading: event.target.value })}
          />
          {block.cards.map((card, index) => (
            <div key={card.id} className="border border-[var(--line)] p-2 space-y-1">
              <input
                placeholder="Card title"
                value={card.title}
                onChange={(event) => {
                  const cards = [...block.cards];
                  cards[index] = { ...card, title: event.target.value };
                  onChange({ ...block, cards });
                }}
              />
              <textarea
                placeholder="Card description"
                rows={2}
                value={card.description}
                onChange={(event) => {
                  const cards = [...block.cards];
                  cards[index] = { ...card, description: event.target.value };
                  onChange({ ...block, cards });
                }}
              />
              <MediaSlot
                image={card.image}
                onChange={(image) => {
                  const cards = [...block.cards];
                  cards[index] = { ...card, image };
                  onChange({ ...block, cards });
                }}
              />
              <button
                type="button"
                className="text-xs text-red-700 underline"
                onClick={() => onChange({ ...block, cards: block.cards.filter((c) => c.id !== card.id) })}
              >
                Remove card
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-sm underline"
            onClick={() =>
              onChange({ ...block, cards: [...block.cards, { id: crypto.randomUUID(), title: '', description: '' }] })
            }
          >
            + Add card
          </button>
        </div>
      );
    case 'quote':
      return (
        <div className="space-y-2">
          <textarea placeholder="Quote" rows={2} value={block.quote} onChange={(event) => onChange({ ...block, quote: event.target.value })} />
          <input
            placeholder="Attribution (optional)"
            value={block.attribution ?? ''}
            onChange={(event) => onChange({ ...block, attribution: event.target.value })}
          />
        </div>
      );
    case 'cta':
      return (
        <div className="space-y-2">
          <input placeholder="Heading" value={block.heading} onChange={(event) => onChange({ ...block, heading: event.target.value })} />
          <textarea
            placeholder="Body (optional)"
            rows={2}
            value={block.body ?? ''}
            onChange={(event) => onChange({ ...block, body: event.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Button label"
              value={block.buttonLabel ?? ''}
              onChange={(event) => onChange({ ...block, buttonLabel: event.target.value })}
            />
            <input
              placeholder="Button URL"
              value={block.buttonUrl ?? ''}
              onChange={(event) => onChange({ ...block, buttonUrl: event.target.value })}
            />
          </div>
        </div>
      );
  }
}

export function BlockEditor({ blocks, onChange }: { blocks: ContentBlock[]; onChange: (blocks: ContentBlock[]) => void }) {
  const [addType, setAddType] = useState<ContentBlock['type']>('richText');

  function updateBlock(id: string, next: ContentBlock) {
    onChange(blocks.map((block) => (block.id === id ? next : block)));
  }

  function removeBlock(id: string) {
    onChange(blocks.filter((block) => block.id !== id));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => (
        <div key={block.id} className="bg-white border border-[var(--line)] p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">{BLOCK_LABELS[block.type]}</p>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Move up" disabled={index === 0} onClick={() => move(index, -1)} className="disabled:opacity-30">
                <ArrowUp size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Move down"
                disabled={index === blocks.length - 1}
                onClick={() => move(index, 1)}
                className="disabled:opacity-30"
              >
                <ArrowDown size={16} aria-hidden="true" />
              </button>
              <button type="button" aria-label="Remove block" onClick={() => removeBlock(block.id)} className="text-red-700">
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
          <BlockFields block={block} onChange={(next) => updateBlock(block.id, next)} />
        </div>
      ))}

      <div className="flex items-center gap-2">
        <select value={addType} onChange={(event) => setAddType(event.target.value as ContentBlock['type'])}>
          {Object.entries(BLOCK_LABELS).map(([type, label]) => (
            <option key={type} value={type}>
              {label}
            </option>
          ))}
        </select>
        <button type="button" className="button button-outline border border-[var(--ink)] text-[var(--ink)]" onClick={() => onChange([...blocks, newBlock(addType)])}>
          + Add block
        </button>
      </div>
    </div>
  );
}
