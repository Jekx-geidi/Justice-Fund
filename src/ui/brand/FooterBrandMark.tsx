'use client';

import { useEffect, useState } from 'react';
import { BRAND_CHOOSER_ENABLED } from '@/lib/brand/env';
import { resolveLogoConcept, getLogoConcept } from '@/lib/brand/logo-concepts';
import { MarkIcon } from '@/ui/brand/MarkIcon';

/** Renders the preferred logo concept's mark beside the footer credit line, when one is set. */
export function FooterBrandMark() {
  const [logoId, setLogoId] = useState<string | null>(null);
  useEffect(() => {
    if (!BRAND_CHOOSER_ENABLED) return;
    try {
      setLogoId(resolveLogoConcept(localStorage.getItem('logo')));
    } catch {}
  }, []);
  if (!BRAND_CHOOSER_ENABLED || !logoId) return null;
  const concept = getLogoConcept(logoId);
  if (!concept) return null;
  return <MarkIcon mark={concept.mark} size={16} />;
}
