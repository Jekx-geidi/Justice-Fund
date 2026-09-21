'use client';

import { useState } from 'react';
import type { MediaReference } from '@/lib/content/types';
import { MediaSlot } from '../media/MediaSlot';

export function AdminProfileForm({ initial }: { initial: MediaReference | null }) {
  const [avatar, setAvatar] = useState(initial);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleChange(next: MediaReference | null) {
    setAvatar(next);
    setStatus('saving');
    setError(null);

    const response = await fetch('/api/admin/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatar: next }),
    }).catch(() => null);

    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setStatus('error');
      setError(body?.error ?? 'Could not update your profile picture.');
      return;
    }

    setStatus('saved');
  }

  return (
    <div>
      <p className="text-sm font-medium mb-2">Profile picture</p>
      <p className="text-xs text-[var(--slate)] mb-3">Shown next to your name in the admin sidebar.</p>
      <MediaSlot image={avatar} onChange={handleChange} />
      {status === 'saving' && <p className="text-sm text-[var(--slate)] mt-2">Saving…</p>}
      {status === 'saved' && <p className="text-sm text-green-700 mt-2">Saved</p>}
      {error && (
        <p role="alert" className="text-sm text-red-700 mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
