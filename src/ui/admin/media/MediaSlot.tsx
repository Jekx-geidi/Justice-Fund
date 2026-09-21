'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Pencil, Trash2 } from 'lucide-react';
import type { MediaReference } from '@/lib/content/types';
import { MediaPicker } from './MediaPicker';

/**
 * Drop-in replacement for a raw "paste an image URL" field: shows the
 * current selection (if any) and opens the shared MediaPicker instead of
 * asking the admin to copy/paste a Supabase Storage URL by hand.
 */
export function MediaSlot({ image, onChange }: { image?: MediaReference | null; onChange: (image: MediaReference | null) => void }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="space-y-2">
      {image ? (
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16 shrink-0 bg-[var(--paper)] border border-[var(--line)]">
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="64px"
              className="object-cover"
              style={
                image.focalX != null && image.focalY != null
                  ? { objectPosition: `${image.focalX * 100}% ${image.focalY * 100}%` }
                  : undefined
              }
            />
          </div>
          <div className="flex-1 min-w-0">
            <label className="text-xs text-[var(--slate)]" htmlFor={`alt-${image.id}`}>
              Alt text
            </label>
            <input
              id={`alt-${image.id}`}
              value={image.alt}
              onChange={(event) => onChange({ ...image, alt: event.target.value })}
              maxLength={300}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              aria-label="Change image"
              title="Change image"
              onClick={() => setPickerOpen(true)}
              className="w-10 h-10 grid place-items-center rounded-full text-[var(--ink)] hover:bg-[var(--paper)] border border-[var(--line)]"
            >
              <Pencil size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Remove image"
              title="Remove image"
              onClick={() => onChange(null)}
              className="w-10 h-10 grid place-items-center rounded-full text-red-700 hover:bg-red-50 border border-[var(--line)]"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="button button-outline border border-[var(--ink)] text-[var(--ink)]" onClick={() => setPickerOpen(true)}>
          Choose Image
        </button>
      )}

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        currentId={image?.id}
        onSelect={(reference) => {
          onChange(reference);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
