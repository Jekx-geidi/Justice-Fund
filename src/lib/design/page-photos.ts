import type { SitePage } from './types.ts';

/**
 * One photo per page (April, 29 Sep), free under the Unsplash License and chosen to match her references.
 * `width`/`height` are the file's own size (for next/image). `position` is the CSS object-position that keeps the subject in frame when the photo is cropped.
 * Photographers, sources and licence notes: public/images/pages/CREDITS.md.
 */
export const PAGE_PHOTOS: Record<SitePage, { src: string; width: number; height: number; alt: string; position: string }> = {
  home: {
    src: '/images/pages/home.webp',
    width: 1400,
    height: 1294,
    alt: 'Earth seen from space, with ocean and clouds below',
    // Cropped to the left 72% of the original to drop the satellite; frame low to keep the horizon's edge out.
    position: '50% 70%',
  },
  about: {
    src: '/images/pages/about.webp',
    width: 1200,
    height: 1800,
    alt: 'People planting young trees together in a forest',
    // A tall photo in a wide banner: frame on the girl planting the seedling, the action of the shot.
    position: '50% 70%',
  },
  insights: {
    src: '/images/pages/insights.webp',
    width: 1000,
    height: 1250,
    alt: 'Aerial drone view of a river winding through rainforest',
    position: '50% 50%',
  },
  contact: {
    src: '/images/pages/contact.webp',
    width: 1600,
    height: 1048,
    alt: 'Perth city skyline lit up at night, reflected in the Swan River',
    position: '30% 55%',
  },
};
