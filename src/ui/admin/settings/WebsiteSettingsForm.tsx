'use client';

import { useState } from 'react';
import type { SiteSettings } from '@/lib/settings/siteSettings';
import { MaterialButton, MaterialTextField } from '../material/MaterialControls';
import { useMaterialWeb } from '../material/useMaterialWeb';

type Status = 'idle' | 'saving' | 'saved' | 'error';

export function WebsiteSettingsForm({ initial }: { initial: SiteSettings }) {
  const [values, setValues] = useState(initial);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const materialReady = useMaterialWeb([
    () => import('@material/web/textfield/outlined-text-field.js'),
    () => import('@material/web/button/filled-button.js'),
  ]);

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
      <MaterialTextField ready={materialReady} id="settings-org-name" label="Organisation Name" value={values.orgName} onChange={(value) => set('orgName', value)} maxLength={150} />
      <MaterialTextField
        ready={materialReady}
        id="settings-contact-email"
        label="Default Contact Email"
        type="email"
        value={values.contactEmail}
        onChange={(value) => set('contactEmail', value)}
        maxLength={200}
      />
      <MaterialTextField ready={materialReady} id="settings-location" label="Location" value={values.location} onChange={(value) => set('location', value)} maxLength={200} />
      <MaterialTextField
        ready={materialReady}
        id="settings-footer-text"
        label="Footer Text"
        value={values.footerText}
        onChange={(value) => set('footerText', value)}
        maxLength={300}
      />
      <MaterialTextField
        ready={materialReady}
        id="settings-seo-title"
        label="Default SEO Title"
        value={values.seoTitle}
        onChange={(value) => set('seoTitle', value)}
        maxLength={160}
      />
      <MaterialTextField
        ready={materialReady}
        id="settings-seo-description"
        label="Default SEO Description"
        value={values.seoDescription}
        onChange={(value) => set('seoDescription', value)}
        multiline
        rows={2}
        maxLength={300}
      />
      <div>
        <MaterialTextField
          ready={materialReady}
          id="settings-logo-url"
          label="Logo / Brand Mark URL"
          value={values.logoUrl}
          onChange={(value) => set('logoUrl', value)}
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
        <MaterialButton ready={materialReady} variant="filled" type="submit" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : 'Save Changes'}
        </MaterialButton>
        {status === 'saved' && <span className="text-sm text-green-700">Saved</span>}
      </div>
      <p className="text-xs text-[var(--slate)]">
        These values are saved for future use across the site. They don&rsquo;t yet change the published pages
        themselves.
      </p>
    </form>
  );
}
