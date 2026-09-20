'use client';

import { useRef } from 'react';
import type { MediaItem } from '@/lib/media/types';

const PREVIEWS: { label: string; ratio: number }[] = [
  { label: 'Desktop', ratio: 16 / 9 },
  { label: 'Tablet', ratio: 4 / 3 },
  { label: 'Mobile', ratio: 3 / 4 },
];

const STEP = 0.02;

export function FocalPointEditor({
  item,
  focalX,
  focalY,
  onChange,
}: {
  item: MediaItem;
  focalX: number;
  focalY: number;
  onChange: (x: number, y: number) => void;
}) {
  const areaRef = useRef<HTMLDivElement>(null);

  function setFromPointer(clientX: number, clientY: number) {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    onChange(Math.round(x * 1000) / 1000, Math.round(y * 1000) / 1000);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-STEP, 0],
      ArrowRight: [STEP, 0],
      ArrowUp: [0, -STEP],
      ArrowDown: [0, STEP],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    onChange(Math.min(1, Math.max(0, focalX + move[0])), Math.min(1, Math.max(0, focalY + move[1])));
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-2">Focal point</p>
        <p className="text-xs text-[var(--slate)] mb-3">
          Click the part of the image that matters most. It stays in frame when the image is cropped for hero, card
          or mobile layouts.
        </p>
        <div
          ref={areaRef}
          role="button"
          tabIndex={0}
          aria-label={`Set focal point. Currently ${Math.round(focalX * 100)}% across, ${Math.round(focalY * 100)}% down. Use arrow keys to adjust.`}
          onClick={(event) => setFromPointer(event.clientX, event.clientY)}
          onKeyDown={handleKeyDown}
          className="relative aspect-[4/3] max-w-sm cursor-crosshair border border-[var(--line)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- needs raw click coordinates, not next/image's fill sizing */}
          <img src={item.url} alt={item.altText} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
          <span
            aria-hidden="true"
            className="absolute w-4 h-4 rounded-full border-2 border-white bg-[var(--gold)] shadow -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${focalX * 100}%`, top: `${focalY * 100}%` }}
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Preview</p>
        <div className="grid grid-cols-3 gap-3">
          {PREVIEWS.map((preview) => (
            <div key={preview.label}>
              <div className="border border-[var(--line)] overflow-hidden" style={{ aspectRatio: preview.ratio }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- small crop preview, not worth next/image's overhead here */}
                <img
                  src={item.url}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ objectPosition: `${focalX * 100}% ${focalY * 100}%` }}
                />
              </div>
              <p className="text-xs text-[var(--slate)] mt-1 text-center">{preview.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
