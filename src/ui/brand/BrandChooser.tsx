'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BRANDS } from '@/lib/brand/brands';
import { TYPEFACES, getTypeface, googleFontsUrl } from '@/lib/brand/typefaces';

function applyTypeface(id: string | null) {
  document.documentElement.removeAttribute('data-type');
  document.getElementById('brand-typeface-font')?.remove();
  if (!id) return;
  document.documentElement.setAttribute('data-type', id);
  const url = googleFontsUrl(getTypeface(id));
  if (!url) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  link.id = 'brand-typeface-font';
  document.head.appendChild(link);
}

/**
 * Floating preview-only chooser — bottom-right, rendered on every page when
 * `NEXT_PUBLIC_BRAND_CHOOSER=true`. Two independent axes, each persisted to
 * `localStorage` and applied to the live document immediately, no reload.
 */
export function BrandChooser() {
  const [brand, setBrand] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [typeOpen, setTypeOpen] = useState(false);

  useEffect(() => {
    setBrand(document.documentElement.dataset.brand ?? null);
    setType(document.documentElement.dataset.type ?? null);
  }, []);

  function chooseBrand(id: string) {
    document.documentElement.setAttribute('data-brand', id);
    try {
      localStorage.setItem('brand', id);
    } catch {}
    setBrand(id);
    window.dispatchEvent(new CustomEvent('brandchooser:brand', { detail: id }));
  }

  function chooseType(id: string | null) {
    applyTypeface(id);
    try {
      if (id) localStorage.setItem('type', id);
      else localStorage.removeItem('type');
    } catch {}
    setType(id);
  }

  return (
    <div className="brand-chooser" role="region" aria-label="Brand and design preview controls">
      <div className="brand-chooser-row" role="group" aria-label="Colour direction">
        {BRANDS.map((direction) => (
          <button
            key={direction.id}
            type="button"
            className="brand-chooser-button"
            aria-pressed={brand === direction.id}
            onClick={() => chooseBrand(direction.id)}
          >
            {direction.label}
          </button>
        ))}
        <Link href="/brand" className="brand-chooser-button brand-chooser-link">
          Compare
        </Link>
      </div>
      <div className="brand-chooser-row brand-chooser-type-row">
        <button
          type="button"
          className="brand-chooser-button brand-chooser-toggle"
          aria-expanded={typeOpen}
          aria-controls="brand-chooser-type-options"
          onClick={() => setTypeOpen((open) => !open)}
        >
          Type ▾
        </button>
        <div
          id="brand-chooser-type-options"
          className="brand-chooser-type-options"
          role="group"
          aria-label="Type pairing"
          hidden={false}
          data-open={typeOpen}
        >
          <button
            type="button"
            className="brand-chooser-button"
            aria-pressed={type === null}
            onClick={() => chooseType(null)}
          >
            Default
          </button>
          {TYPEFACES.map((pairing) => (
            <button
              key={pairing.id}
              type="button"
              className="brand-chooser-button"
              aria-pressed={type === pairing.id}
              onClick={() => chooseType(pairing.id)}
            >
              {pairing.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
