'use client';

import { useEffect, useState } from 'react';
import { BRANDS, resolveBrand } from '@/lib/brand/brands';
import { TYPEFACES, googleFontsUrlForAll, resolveTypeface } from '@/lib/brand/typefaces';
import { MARKS, resolveMark } from '@/lib/brand/marks';
import { LOGO_CONCEPTS, resolveLogoConcept } from '@/lib/brand/logo-concepts';
import { MarkIcon } from '@/ui/brand/MarkIcon';

function BrandComparePage() {
  const [brand, setBrandState] = useState<string | null>(null);
  const [type, setTypeState] = useState<string | null>(null);
  const [mark, setMarkState] = useState<string | null>(null);
  const [logo, setLogoState] = useState<string | null>(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = googleFontsUrlForAll(TYPEFACES);
    link.id = 'brand-compare-fonts';
    document.head.appendChild(link);
    try {
      setBrandState(resolveBrand(localStorage.getItem('brand')));
      setTypeState(resolveTypeface(localStorage.getItem('type')));
      setMarkState(resolveMark(localStorage.getItem('mark')));
      setLogoState(resolveLogoConcept(localStorage.getItem('logo')));
    } catch {}
    return () => link.remove();
  }, []);

  function applyDirection(id: string) {
    document.documentElement.setAttribute('data-brand', id);
    try {
      localStorage.setItem('brand', id);
    } catch {}
    setBrandState(id);
    window.dispatchEvent(new CustomEvent('brandchooser:brand', { detail: id }));
  }

  function applyType(id: string) {
    document.documentElement.setAttribute('data-type', id);
    try {
      localStorage.setItem('type', id);
    } catch {}
    setTypeState(id);
  }

  function preferMark(id: string) {
    try {
      localStorage.setItem('mark', id);
    } catch {}
    setMarkState(id);
  }

  function preferLogo(id: string) {
    try {
      localStorage.setItem('logo', id);
    } catch {}
    setLogoState(id);
  }

  return (
    <div className="wrap brand-compare-body">
      <h1>Brand &amp; design comparison</h1>
      <p className="lead">Internal only — not indexed, not linked from the public site.</p>

      <section className="brand-compare-section">
        <h2>Directions</h2>
        <div className="direction-grid">
          {BRANDS.map((direction) => (
            <div
              key={direction.id}
              className="direction-card"
              style={
                {
                  '--ink': direction.tokens.ink,
                  '--deep': direction.tokens.deep,
                  '--paper': direction.tokens.paper,
                  '--line': direction.tokens.line,
                  '--gold': direction.tokens.gold,
                  '--slate': direction.tokens.slate,
                } as React.CSSProperties
              }
            >
              <p className="eyebrow">{direction.label}</p>
              <h3>{direction.description}</h3>
              <p className="lead">The quick brown fox jumps over the lazy dog.</p>
              <button
                type="button"
                className="button button-dark"
                aria-pressed={brand === direction.id}
                onClick={() => applyDirection(direction.id)}
              >
                {brand === direction.id ? 'In use' : 'Use this on the site'}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="brand-compare-section">
        <h2>Type pairings</h2>
        <div className="type-grid">
          {TYPEFACES.map((pairing) => (
            <div className="type-card" key={pairing.id}>
              <p
                className="type-sample-heading"
                style={{ fontFamily: `'${pairing.heading.family}', serif`, fontWeight: pairing.heading.weights[0] }}
              >
                Aa Bb Cc
              </p>
              <p className="type-sample-body" style={{ fontFamily: `'${pairing.body.family}', sans-serif` }}>
                The quick brown fox jumps over the lazy dog.
              </p>
              <div className="type-card-footer">
                <span>{pairing.label}</span>
                <button
                  type="button"
                  className="button button-dark"
                  aria-pressed={type === pairing.id}
                  onClick={() => applyType(pairing.id)}
                >
                  {type === pairing.id ? 'In use' : 'Use this'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="brand-compare-section">
        <h2>Logo concepts</h2>
        <div className="logo-grid">
          {LOGO_CONCEPTS.map((concept) => (
            <div className={`logo-card logo-card-${concept.layout}`} key={concept.id}>
              <MarkIcon mark={concept.mark} size={40} />
              <span className="logo-card-wordmark">Intergenerational Justice Fund</span>
              <button
                type="button"
                className="button button-dark"
                aria-pressed={logo === concept.id}
                onClick={() => preferLogo(concept.id)}
              >
                {logo === concept.id ? 'Preferred' : 'Prefer this concept'}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="brand-compare-section">
        <h2>Abstract marks</h2>
        <div className="mark-grid">
          {MARKS.map((m) => (
            <div className="mark-card" key={m.id}>
              <MarkIcon mark={m} size={48} />
              <p>{m.label}</p>
              <button
                type="button"
                className="button button-dark"
                aria-pressed={mark === m.id}
                onClick={() => preferMark(m.id)}
              >
                {mark === m.id ? 'Preferred' : 'Prefer this mark'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function PreviewPage() {
  if (process.env.NEXT_PUBLIC_BRAND_CHOOSER !== 'true') return null;
  return <BrandComparePage />;
}
