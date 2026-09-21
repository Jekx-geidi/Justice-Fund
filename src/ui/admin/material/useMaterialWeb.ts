'use client';
import { useEffect, useState } from 'react';

type Loader = () => Promise<unknown>;

/**
 * Registers only the specific @material/web custom elements a caller asks
 * for (never the whole library), client-side only (Next SSR has no
 * `customElements`). Callers pass loaders, not module paths, so each
 * consumer's bundle only pulls in what it actually renders.
 */
export function useMaterialWeb(loaders: Loader[]): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all(loaders.map((load) => load()))
      .then(() => {
        if (active) setReady(true);
      })
      .catch(() => {
        /* Native controls remain the fallback if a module fails to load. */
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loaders is a fresh array each render by design; only the first mount's imports matter.
  }, []);

  return ready;
}
