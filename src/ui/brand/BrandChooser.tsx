'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BRANDS, DEFAULT_BRAND, resolveBrand } from '@/lib/brand/brands';
import { TYPEFACES, getTypeface, googleFontsUrl, resolveTypeface } from '@/lib/brand/typefaces';

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
function BrandChooserPreview() {
  const [brand, setBrand] = useState<string | null>(DEFAULT_BRAND);
  const [type, setType] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    function syncChoices() {
      setBrand(resolveBrand(document.documentElement.dataset.brand));
      setType(resolveTypeface(document.documentElement.dataset.type));
    }
    syncChoices();
    setCollapsed(document.documentElement.dataset.chooserCollapsed === 'true');
    const observer = new MutationObserver(syncChoices);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-brand', 'data-type'] });
    return () => observer.disconnect();
  }, []);

  function togglePanel() {
    const next = !collapsed;
    document.documentElement.dataset.chooserCollapsed = String(next);
    try { localStorage.setItem('chooserCollapsed', String(next)); } catch {}
    setCollapsed(next);
  }

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
      <button type="button" className="brand-chooser-button brand-chooser-toggle"
        aria-expanded={!collapsed} aria-controls="brand-chooser-body" onClick={togglePanel}>
        {collapsed ? 'Design ▾' : '▴ Collapse'}
      </button>
      <div id="brand-chooser-body" className="brand-chooser-body" hidden={collapsed}>
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
        <div className="brand-chooser-row" role="group" aria-label="Type pairing">
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

export const BrandChooser = process.env.NEXT_PUBLIC_BRAND_CHOOSER === 'true'
  ? BrandChooserPreview
  : () => null;
