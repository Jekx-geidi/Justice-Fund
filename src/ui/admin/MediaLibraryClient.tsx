'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import type { MediaReference } from '@/lib/content/types';

export function MediaLibraryClient({ initialItems }: { initialItems: MediaReference[] }) {
  const [items, setItems] = useState(initialItems);
  const [alt, setAlt] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleUpload(event: React.FormEvent) {
    event.preventDefault();
    const file = fileInput.current?.files?.[0];
    if (!file || !alt.trim()) {
      setError('Choose a file and describe it with alt text.');
      return;
    }

    setUploading(true);
    setError(null);

    const form = new FormData();
    form.append('file', file);
    form.append('alt', alt.trim());

    const response = await fetch('/api/admin/media', { method: 'POST', body: form }).catch(() => null);
    setUploading(false);

    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setError(body?.error ?? 'Upload failed.');
      return;
    }

    const { media } = await response.json();
    setItems((prev) => [media, ...prev]);
    setAlt('');
    if (fileInput.current) fileInput.current.value = '';
  }

  async function handleDelete(id: string) {
    const response = await fetch(`/api/admin/media/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => null);

    if (response?.status === 409) {
      const confirmed = window.confirm('This image is used on the live site. Delete it anyway?');
      if (!confirmed) return;
      await fetch(`/api/admin/media/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true }),
      }).catch(() => null);
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div>
      <form onSubmit={handleUpload} className="bg-white border border-[var(--line)] p-6 max-w-md mb-8 space-y-3">
        <div className="field">
          <label htmlFor="media-file">Image (JPEG, PNG or WebP)</label>
          <input id="media-file" type="file" accept="image/jpeg,image/png,image/webp" ref={fileInput} required />
        </div>
        <div className="field">
          <label htmlFor="media-alt">Alt text</label>
          <input id="media-alt" value={alt} onChange={(event) => setAlt(event.target.value)} required maxLength={300} />
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <button type="submit" className="button button-dark" disabled={uploading}>
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <figure key={item.id} className="bg-white border border-[var(--line)] p-2">
            <div className="relative aspect-square bg-[var(--paper)]">
              <Image src={item.url} alt={item.alt} fill sizes="200px" className="object-cover" />
            </div>
            <figcaption className="text-xs text-[var(--slate)] mt-2 truncate">{item.alt}</figcaption>
            <p className="text-xs mt-1 truncate select-all">{item.url}</p>
            <button type="button" onClick={() => handleDelete(item.id)} className="text-xs text-red-700 underline mt-1">
              Delete
            </button>
          </figure>
        ))}
      </div>
    </div>
  );
}
