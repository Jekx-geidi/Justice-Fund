import type { ColourPage } from './types.ts';

/**
 * One photo per page (April, 29 Sep), free under the Unsplash License and chosen to match her references.
 * `position` is the CSS object-position that keeps the subject in frame when the photo is cropped.
 * Credits and licence notes: public/images/pages/CREDITS.md.
 */
export const PAGE_PHOTOS: Record<ColourPage, { src: string; alt: string; credit: string; source: string; position: string }> = {
  home: {
    src: '/images/pages/home.webp',
    alt: 'Earth seen from space, with ocean and clouds below',
    credit: 'NASA',
    source: 'https://unsplash.com/photos/yZygONrUBe8',
    // Cropped to the left 72% of the original to drop the satellite; frame low to keep the horizon's edge out.
    position: '50% 70%',
  },
  about: {
    src: '/images/pages/about.webp',
    alt: 'People planting young trees together in a forest',
    credit: 'Eyoel Kahssay',
    source: 'https://unsplash.com/photos/FyCjvyPG9Pg',
    // A tall photo in a wide banner: frame on the girl planting the seedling, the action of the shot.
    position: '50% 70%',
  },
  insights: {
    src: '/images/pages/insights.webp',
    alt: 'Aerial drone view of a river winding through rainforest',
    credit: 'Paulo Freitas',
    source: 'https://unsplash.com/photos/cv9_7yqwKzE',
    position: '50% 50%',
  },
  contact: {
    src: '/images/pages/contact.webp',
    alt: 'Perth city skyline lit up at night, reflected in the Swan River',
    credit: 'Eddie Mark Blair',
    source: 'https://unsplash.com/photos/XU3sz-IJANk',
    position: '30% 55%',
  },
};
