'use client';

import { useEffect, useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { MEDIA_CATEGORIES, MEDIA_CATEGORY_LABELS, type MediaItem } from '@/lib/media/types';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function uploadWithProgress(form: FormData, onProgress: (percent: number) => void): Promise<{ status: number; body: { media?: MediaItem; error?: string } }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/media');
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      let body: { media?: MediaItem; error?: string } = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        body = { error: "We couldn't upload this image. Please try again." };
      }
      resolve({ status: xhr.status, body });
    };
    xhr.onerror = () => reject(new Error('network error'));
    xhr.send(form);
  });
}

export function UploadDialog({ open, onClose, onUploaded }: { open: boolean; onClose: () => void; onUploaded: (media: MediaItem) => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [alt, setAlt] = useState('');
  const [category, setCategory] = useState<(typeof MEDIA_CATEGORIES)[number]>('uncategorized');
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'uploaded'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function reset() {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setTitle('');
    setAlt('');
    setCategory('uncategorized');
    setStatus('idle');
    setProgress(0);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleClose() {
    reset();
    onClose();
  }

  function pickFile(next: File | null) {
    setError(null);
    if (!next) return;
    if (!ACCEPTED_TYPES.includes(next.type) && next.type !== '') {
      // Client-side hint only — the server re-checks real file bytes regardless.
      setError("This file type isn't supported. Use JPEG, PNG, or WebP.");
      return;
    }
    setFile(next);
    setPreviewUrl(URL.createObjectURL(next));
    setTitle((current) => current || next.name.replace(/\.[^.]+$/, ''));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setError('Choose an image to upload.');
      return;
    }
    if (!alt.trim()) {
      setError('Alt text is required so screen reader users know what this image shows.');
      return;
    }

    setStatus('uploading');
    setError(null);
    setProgress(0);

    const form = new FormData();
    form.append('file', file);
    form.append('alt', alt.trim());
    if (title.trim()) form.append('title', title.trim());
    form.append('category', category);

    try {
      const { status: httpStatus, body } = await uploadWithProgress(form, setProgress);
      if (httpStatus >= 200 && httpStatus < 300 && body.media) {
        setStatus('uploaded');
        onUploaded(body.media);
        setTimeout(handleClose, 500);
        return;
      }
      setError(body.error ?? "We couldn't upload this image. Please try again.");
      setStatus('idle');
    } catch {
      setError("We couldn't upload this image. Please try again.");
      setStatus('idle');
    }
  }

  return (
    <dialog ref={dialogRef} className="media-dialog" onCancel={handleClose} aria-label="Upload media">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg">Upload media</h2>
          <button type="button" onClick={handleClose} className="text-sm underline" aria-label="Close">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!file && (
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);
                pickFile(event.dataTransfer.files?.[0] ?? null);
              }}
              className={`border-2 border-dashed p-10 text-center ${dragActive ? 'border-[var(--gold)] bg-[var(--paper)]' : 'border-[var(--line)]'}`}
            >
              <UploadCloud size={28} aria-hidden="true" className="mx-auto mb-3 text-[var(--slate)]" />
              <p className="text-sm mb-3">Drag an image here</p>
              <p className="text-xs text-[var(--slate)] mb-3">or</p>
              <button type="button" className="button button-outline border border-[var(--ink)] text-[var(--ink)]" onClick={() => fileInputRef.current?.click()}>
                Choose file
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-[var(--slate)] mt-3">JPEG, PNG or WebP · up to 8MB</p>
            </div>
          )}

          {file && (
            <>
              <div className="flex gap-4 items-start">
                {previewUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- local object URL preview, not a served asset
                  <img src={previewUrl} alt="" className="w-28 h-28 object-cover border border-[var(--line)]" />
                )}
                <div className="text-sm">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-[var(--slate)]">{Math.round(file.size / 1024)} KB</p>
                  <button type="button" className="text-xs underline mt-2" onClick={() => pickFile(null)} disabled={status === 'uploading'}>
                    Choose a different file
                  </button>
                </div>
              </div>

              <div className="field">
                <label htmlFor="upload-title">Title</label>
                <input id="upload-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={150} />
              </div>
              <div className="field">
                <label htmlFor="upload-alt">Alt text</label>
                <input id="upload-alt" value={alt} onChange={(event) => setAlt(event.target.value)} required maxLength={300} />
              </div>
              <div className="field">
                <label htmlFor="upload-category">Category</label>
                <select id="upload-category" value={category} onChange={(event) => setCategory(event.target.value as typeof category)}>
                  {MEDIA_CATEGORIES.map((value) => (
                    <option key={value} value={value}>
                      {MEDIA_CATEGORY_LABELS[value]}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}

          {status === 'uploading' && (
            <div>
              <div className="h-2 bg-[var(--paper)] border border-[var(--line)]">
                <div className="h-full bg-[var(--gold)] transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-[var(--slate)] mt-1">Uploading… {progress}%</p>
            </div>
          )}
          {status === 'uploaded' && <p className="text-sm text-green-700">Uploaded</p>}

          {file && (
            <div className="flex justify-end gap-3">
              <button type="button" className="button button-outline border border-[var(--ink)] text-[var(--ink)]" onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="button button-dark" disabled={status === 'uploading'}>
                {status === 'uploading' ? 'Uploading…' : 'Save Media'}
              </button>
            </div>
          )}
        </form>
      </div>
    </dialog>
  );
}
