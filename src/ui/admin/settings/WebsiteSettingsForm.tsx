'use client';

import { useState } from 'react';
import type { SiteSettings } from '@/lib/settings/siteSettings';

type Status = 'idle' | 'saving' | 'saved' | 'error';

export function WebsiteSettingsForm({ initial }: { initial: SiteSettings }) {
  const [values, setValues] = useState(initial);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setStatus('idle');
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setStatus('saving');
    setError(null);

    const response = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orgName: values.orgName,
        contactEmail: values.contactEmail,
        location: values.location,
        footerText: values.footerText,
        seoTitle: values.seoTitle,
        seoDescription: values.seoDescription,
        logoUrl: values.logoUrl,
      }),
    }).catch(() => null);

    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setStatus('error');
      setError(body?.error ?? 'Settings could not be saved. Please try again.');
      return;
    }

    setStatus('saved');
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="field">
        <label htmlFor="settings-org-name">Organisation Name</label>
        <input id="settings-org-name" value={values.orgName} onChange={(event) => set('orgName', event.target.value)} maxLength={150} />
      </div>
      <div className="field">
        <label htmlFor="settings-contact-email">Default Contact Email</label>
        <input
          id="settings-contact-email"
          type="email"
          value={values.contactEmail}
          onChange={(event) => set('contactEmail', event.target.value)}
          maxLength={200}
        />
      </div>
      <div className="field">
        <label htmlFor="settings-location">Location</label>
        <input id="settings-location" value={values.location} onChange={(event) => set('location', event.target.value)} maxLength={200} />
      </div>
      <div className="field">
        <label htmlFor="settings-footer-text">Footer Text</label>
        <input id="settings-footer-text" value={values.footerText} onChange={(event) => set('footerText', event.target.value)} maxLength={300} />
      </div>
      <div className="field">
        <label htmlFor="settings-seo-title">Default SEO Title</label>
        <input id="settings-seo-title" value={values.seoTitle} onChange={(event) => set('seoTitle', event.target.value)} maxLength={160} />
      </div>
      <div className="field">
        <label htmlFor="settings-seo-description">Default SEO Description</label>
        <textarea
          id="settings-seo-description"
          rows={2}
          value={values.seoDescription}
          onChange={(event) => set('seoDescription', event.target.value)}
          maxLength={300}
        />
      </div>
      <div className="field">
        <label htmlFor="settings-logo-url">Logo / Brand Mark URL</label>
        <input
          id="settings-logo-url"
          value={values.logoUrl}
          onChange={(event) => set('logoUrl', event.target.value)}
          placeholder="/images/logo-iejf.svg"
          maxLength={500}
        />
        <p className="text-xs text-[var(--slate)] mt-1">Copy a URL from the Media Library.</p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" className="button button-dark" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : 'Save Changes'}
        </button>
        {status === 'saved' && <span className="text-sm text-green-700">Saved</span>}
      </div>
      <p className="text-xs text-[var(--slate)]">
        These values are saved for future use across the site. They don&rsquo;t yet change the published pages
        themselves.
      </p>
    </form>
  );
}
