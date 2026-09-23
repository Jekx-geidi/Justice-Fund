'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronLeft, UserRound } from 'lucide-react';
import { BRANDS, DEFAULT_BRAND, resolveBrand } from '@/lib/brand/brands';
import { TYPEFACES, getTypeface, googleFontsUrl, resolveTypeface } from '@/lib/brand/typefaces';
import { LOGO_CONCEPTS, resolveLogoConcept } from '@/lib/brand/logo-concepts';

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
  // Public visitors see it too, so it starts as the small pill and only opens once someone asks for it.
  const [collapsed, setCollapsed] = useState(true);
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    try { setLogo(resolveLogoConcept(localStorage.getItem('logo'))); } catch {}
    const onLogo = (e: Event) => setLogo(resolveLogoConcept((e as CustomEvent<string | null>).detail));
    window.addEventListener('brandchooser:logo', onLogo);
    return () => window.removeEventListener('brandchooser:logo', onLogo);
  }, []);

  useEffect(() => {
    function syncChoices() {
      setBrand(resolveBrand(document.documentElement.dataset.brand));
      setType(resolveTypeface(document.documentElement.dataset.type));
    }
    syncChoices();
    setCollapsed(document.documentElement.dataset.chooserCollapsed !== 'false');
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

  function chooseLogo(id: string | null) {
    try {
      if (id) localStorage.setItem('logo', id);
      else localStorage.removeItem('logo');
    } catch {}
    setLogo(id);
    window.dispatchEvent(new CustomEvent('brandchooser:logo', { detail: id }));
  }

  return (
    <div className="brand-chooser" role="region" aria-label="Control panel"
      onKeyDown={(e) => { if (e.key === 'Escape' && !collapsed) togglePanel(); }}>
      <div className="brand-chooser-head">
        <span className="brand-chooser-title">
          <UserRound size={14} aria-hidden="true" /> Control panel
        </span>
        <button type="button" className="brand-chooser-toggle"
          aria-expanded={!collapsed} aria-controls="brand-chooser-body"
          aria-label={collapsed ? 'Open control panel' : 'Collapse control panel'}
          onClick={togglePanel}>
          <span className="brand-chooser-toggle-open"><UserRound size={16} aria-hidden="true" /> Control panel</span>
          <span className="brand-chooser-toggle-close"><ChevronLeft size={18} aria-hidden="true" /></span>
        </button>
      </div>
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
        <div className="brand-chooser-row" role="group" aria-label="Logo">
          <button
            type="button"
            className="brand-chooser-button"
            aria-pressed={logo === null}
            onClick={() => chooseLogo(null)}
          >
            No logo
          </button>
          {LOGO_CONCEPTS.map((concept) => (
            <button
              key={concept.id}
              type="button"
              className="brand-chooser-button brand-chooser-logo"
              aria-pressed={logo === concept.id}
              aria-label={`${concept.name} logo`}
              title={concept.name}
              onClick={() => chooseLogo(concept.id)}
            >
              <img src={concept.thumb} alt="" width={36} height={36} />
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
