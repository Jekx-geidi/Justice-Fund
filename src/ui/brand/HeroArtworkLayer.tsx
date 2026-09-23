'use client';

import { useEffect, useState } from 'react';
import { BRAND_CHOOSER_ENABLED } from '@/lib/brand/env';
import { resolveBrand } from '@/lib/brand/brands';
import { getHero, resolveHero, resolveLoop } from '@/lib/brand/artwork';

/**
 * Purely additive background layer behind the home hero's text — a no-op
 * (renders nothing) unless the chooser is enabled and a hero has been
 * picked on `/brand/artwork` for the active direction, so the shipped
 * approved-content.html hero is untouched by default.
 */
export function HeroArtworkLayer() {
  const [swatch, setSwatch] = useState<string | null>(null);
  const [loop, setLoop] = useState(true);

  useEffect(() => {
    if (!BRAND_CHOOSER_ENABLED) return;
    function sync() {
      try {
        const brand = resolveBrand(document.documentElement.dataset.brand);
        const heroId = resolveHero(brand, localStorage.getItem(`hero:${brand}`));
        const hero = getHero(brand, heroId);
        setSwatch(hero?.swatch ?? null);
        setLoop(resolveLoop(localStorage.getItem(`loop:${brand}`)));
      } catch {}
    }
    sync();
    window.addEventListener('brandchooser:brand', sync);
    return () => window.removeEventListener('brandchooser:brand', sync);
  }, []);

  if (!BRAND_CHOOSER_ENABLED || !swatch) return null;
  return (
    <div
      className="hero-artwork-layer"
      data-loop={loop ? 'on' : 'off'}
      style={{ background: swatch }}
      aria-hidden="true"
    />
  );
}
