'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { AboutFields, SitePage } from '@/lib/content/types';
import { HomeFieldsEditor, AboutFieldsEditor, ContactFieldsEditor } from './CoreContentEditors';
import { BlockEditor } from './BlockEditor';
import { PublishBar } from './PublishBar';
import { UnsavedChangesGuard } from './UnsavedChangesGuard';
import { ConfirmDialog } from './ConfirmDialog';
import { AdminEditorLayout } from './live-preview/AdminEditorLayout';
import { LivePreviewPane } from './live-preview/LivePreviewPane';
import { HomePageView } from '@/ui/pages/HomePageView';
import { AboutPageView } from '@/ui/pages/AboutPageView';
import { ContactPageView } from '@/ui/pages/ContactPageView';
import { BlockRenderer } from '@/ui/blocks/BlockRenderer';

function previewHrefFor(page: SitePage): string {
  const base = page.coreKey === 'home' ? '/' : `/${page.slug}`;
  return `${base}${base.includes('?') ? '&' : '?'}preview=1`;
}

export function PageEditorClient({
  page: initialPage,
  aboutForHomePreview,
}: {
  page: SitePage;
  /**
   * Home's preview reuses About's intro/focus-area copy (same as the public
   * page). Not editable here — just the current draft About content, fetched
   * once alongside Home, so the Home preview matches what the public page
   * will actually show.
   */
  aboutForHomePreview?: AboutFields;
}) {
  const [page, setPage] = useState(initialPage);
  const [dirty, setDirty] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function update(patch: Partial<SitePage>) {
    setPage((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  }

  async function saveDraft(): Promise<{ ok: boolean; error?: string }> {
    if (page.isCore) {
      const response = await fetch('/api/admin/content/draft', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pages: [
            {
              id: page.id,
              navLabel: page.navLabel,
              showInNavigation: page.showInNavigation,
              status: page.status,
              home: page.home,
              about: page.about,
              contact: page.contact,
            },
          ],
        }),
      }).catch(() => null);

      if (!response || !response.ok) {
        const body = await response?.json().catch(() => null);
        return { ok: false, error: body?.error ?? 'Save failed.' };
      }
      setDirty(false);
      return { ok: true };
    }

    const response = await fetch(`/api/admin/pages/${page.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: page.title,
        slug: page.slug,
        navLabel: page.navLabel,
        showInNavigation: page.showInNavigation,
        navOrder: page.navOrder,
        status: page.status,
        seo: page.seo,
        blocks: page.blocks,
      }),
    }).catch(() => null);

    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      return { ok: false, error: body?.error ?? 'Save failed.' };
    }
    setDirty(false);
    return { ok: true };
  }

  async function publish(): Promise<{ ok: boolean; error?: string }> {
    const response = await fetch('/api/admin/content/publish', { method: 'POST' }).catch(() => null);
    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      return { ok: false, error: body?.error };
    }
    return { ok: true };
  }

  async function handleDelete() {
    setDeleteError(null);
    const response = await fetch(`/api/admin/pages/${page.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: true }),
    }).catch(() => null);

    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setDeleteError(body?.error ?? 'Delete failed.');
      return;
    }
    window.location.href = '/admin/pages';
  }

  const editor = (
    <div>
      <p className="eyebrow">{page.isCore ? 'CORE PAGE' : 'CUSTOM PAGE'}</p>
      <h1 className="text-3xl mt-2 mb-6">{page.title}</h1>

      <fieldset className="border border-[var(--line)] p-4 mb-6 space-y-4">
        <legend className="text-sm font-medium px-1">Page settings</legend>

        {!page.isCore && (
          <>
            <div className="field">
              <label htmlFor="settings-title">Title</label>
              <input id="settings-title" value={page.title} onChange={(event) => update({ title: event.target.value })} maxLength={150} />
            </div>
            <p className="text-sm text-[var(--slate)]">
              URL: <code>/{page.slug}</code> (fixed after creation)
            </p>
          </>
        )}

        <div className="field">
          <label htmlFor="settings-navlabel">Navigation label</label>
          <input id="settings-navlabel" value={page.navLabel} onChange={(event) => update({ navLabel: event.target.value })} maxLength={60} />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={page.showInNavigation}
            onChange={(event) => update({ showInNavigation: event.target.checked })}
          />
          Show in navigation
        </label>

        <div className="field">
          <label htmlFor="settings-status">Status</label>
          <select id="settings-status" value={page.status} onChange={(event) => update({ status: event.target.value as SitePage['status'] })}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
          </select>
        </div>

        {!page.isCore && (
          <>
            <div className="field">
              <label htmlFor="settings-seo-title">SEO title</label>
              <input
                id="settings-seo-title"
                value={page.seo.title ?? ''}
                onChange={(event) => update({ seo: { ...page.seo, title: event.target.value } })}
                maxLength={160}
              />
            </div>
            <div className="field">
              <label htmlFor="settings-seo-desc">Meta description</label>
              <textarea
                id="settings-seo-desc"
                rows={2}
                value={page.seo.description ?? ''}
                onChange={(event) => update({ seo: { ...page.seo, description: event.target.value } })}
                maxLength={300}
              />
            </div>
          </>
        )}
      </fieldset>

      {page.coreKey === 'home' && page.home && (
        <HomeFieldsEditor value={page.home} onChange={(home) => update({ home })} />
      )}
      {page.coreKey === 'about' && page.about && (
        <AboutFieldsEditor value={page.about} onChange={(about) => update({ about })} />
      )}
      {page.coreKey === 'contact' && page.contact && (
        <ContactFieldsEditor value={page.contact} onChange={(contact) => update({ contact })} />
      )}
      {page.coreKey === 'insights' && (
        <p className="text-sm text-[var(--slate)]">
          Insights entries are managed separately.{' '}
          <Link href="/admin/insights" className="underline">
            Go to Insights
          </Link>
          .
        </p>
      )}
      {!page.isCore && (
        <div>
          <p className="text-sm font-medium mb-3">Content blocks</p>
          <BlockEditor blocks={page.blocks} onChange={(blocks) => update({ blocks })} />
        </div>
      )}

      <PublishBar onSaveDraft={saveDraft} onPublish={publish} dirty={dirty} previewHref={previewHrefFor(page)} />

      {!page.isCore && (
        <div className="mt-8">
          <button type="button" className="text-sm text-red-700 underline" onClick={() => setConfirmingDelete(true)}>
            Delete this page
          </button>
          {deleteError && <p className="text-sm text-red-700 mt-2">{deleteError}</p>}
        </div>
      )}
    </div>
  );

  const previewContent =
    page.coreKey === 'home' && page.home ? (
      <HomePageView home={page.home} about={aboutForHomePreview ?? page.about!} />
    ) : page.coreKey === 'about' && page.about ? (
      <AboutPageView about={page.about} />
    ) : page.coreKey === 'contact' && page.contact ? (
      <ContactPageView contact={page.contact} />
    ) : page.coreKey === 'insights' ? (
      <div className="p-10 text-center text-sm text-[var(--slate)]">
        Insights doesn&rsquo;t have page-level content to preview — see{' '}
        <Link href="/admin/insights" className="underline">
          Insights
        </Link>
        .
      </div>
    ) : (
      <>
        {page.blocks.length === 0 ? (
          <div className="wrap section block-section">
            <h1>{page.title}</h1>
            <p className="text-sm text-[var(--slate)] mt-4">Add a block to see it here.</p>
          </div>
        ) : (
          <BlockRenderer blocks={page.blocks} />
        )}
      </>
    );

  const preview = (
    <LivePreviewPane dirty={dirty} fullPreviewHref={previewHrefFor(page)} resetKey={JSON.stringify(page)}>
      {previewContent}
    </LivePreviewPane>
  );

  return (
    <div>
      <UnsavedChangesGuard dirty={dirty} />
      <AdminEditorLayout editor={editor} preview={preview} />

      <ConfirmDialog
        open={confirmingDelete}
        title={`Delete "${page.title}"?`}
        description="This permanently removes the page and its content. This cannot be undone."
        confirmLabel="Delete page"
        onConfirm={() => {
          setConfirmingDelete(false);
          void handleDelete();
        }}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
