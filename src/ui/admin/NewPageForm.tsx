'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SlugField, slugify } from './SlugField';

export function NewPageForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleTitleChange(next: string) {
    setTitle(next);
    if (!slugTouched) setSlug(slugify(next));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await fetch('/api/admin/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        slug,
        navLabel: title,
        showInNavigation: false,
        navOrder: 0,
        status: 'draft',
        seo: {},
        blocks: [],
      }),
    }).catch(() => null);

    setSubmitting(false);

    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setError(body?.error ?? 'Something went wrong. Please try again.');
      return;
    }

    const { page } = await response.json();
    router.push(`/admin/pages/${page.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4 bg-white border border-[var(--line)] p-6">
      <div className="field">
        <label htmlFor="page-title">Page title</label>
        <input
          id="page-title"
          value={title}
          onChange={(event) => handleTitleChange(event.target.value)}
          required
          maxLength={150}
        />
      </div>
      <SlugField
        value={slug}
        onChange={(next) => {
          setSlug(next);
          setSlugTouched(true);
        }}
      />
      <p className="text-xs text-[var(--slate)]">
        New pages start as a draft, hidden from navigation. You&rsquo;ll add content and publish it from the editor.
      </p>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <button type="submit" className="button button-dark" disabled={submitting || !title || !slug}>
        {submitting ? 'Creating…' : 'Create page'}
      </button>
    </form>
  );
}
