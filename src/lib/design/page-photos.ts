import type { SitePage } from './types.ts';

/**
 * One photo per page (April, 29 Sep), free under the Pexels License and chosen to match her references.
 * `width`/`height` are the file's own size (for next/image). `position` is the CSS object-position that keeps the subject in frame when the photo is cropped.
 * Photographers, sources and licence notes: public/images/pages/CREDITS.md.
 */
export const PAGE_PHOTOS: Record<SitePage, { src: string; width: number; height: number; alt: string; position: string }> = {
  home: {
    src: '/images/pages/earth-clouds.webp',
    width: 1600,
    height: 900,
    alt: 'Earth seen from space, with swirling clouds over the ocean',
    position: '50% 50%',
  },
  about: {
    src: '/images/pages/people-planting.webp',
    width: 1100,
    height: 1650,
    alt: 'A group of people planting a young tree together',
    // A tall photo in a wide banner: frame on the hands planting the tree, the action of the shot.
    position: '50% 62%',
  },
  insights: {
    src: '/images/pages/rainforest-river.webp',
    width: 1600,
    height: 899,
    alt: 'Aerial drone view of a river winding through rainforest',
    position: '50% 60%',
  },
  contact: {
    src: '/images/pages/perth-evening.webp',
    width: 1600,
    height: 1067,
    alt: 'Perth city skyline lit up in the evening over Elizabeth Quay',
    position: '50% 55%',
  },
};
