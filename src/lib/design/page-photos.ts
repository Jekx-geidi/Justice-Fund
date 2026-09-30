import type { SitePage } from './types.ts';

export type PagePhoto = {
  id: string;
  src: string;
  /** 320x200 crop for the Site settings picker. */
  thumb: string;
  /** The file's own size, for next/image. */
  width: number;
  height: number;
  alt: string;
  /** CSS object-position that keeps the subject in frame when the photo is cropped. */
  position: string;
};

const photo = (id: string, width: number, height: number, alt: string, position = '50% 50%'): PagePhoto => ({
  id,
  src: `/images/pages/${id}.webp`,
  thumb: `/images/pages/thumbs/${id}.webp`,
  width,
  height,
  alt,
  position,
});

/**
 * Five photos per page to pick from in Site settings (April, 29 Sep: a photo on each page; Junrey, 30 Sep: about five
 * each). The first is the page default. All free under the Pexels License; photographers and sources are in
 * public/images/pages/CREDITS.md. A replacement photo needs a new file name: next/image and the CDN cache by URL.
 */
export const PHOTO_OPTIONS: Record<SitePage, PagePhoto[]> = {
  home: [
    photo('earth-clouds', 1600, 900, 'Earth seen from space, with swirling clouds over the ocean'),
    photo('earth-americas', 1600, 900, 'Planet Earth from space, showing the Americas and the oceans'),
    photo('earth-africa', 1600, 900, 'Planet Earth from space, showing Africa and the oceans'),
    photo('earth-night-horizon', 1600, 900, "Earth's curved horizon at night, with city lights below"),
    photo('earth-blue-planet', 1600, 900, 'The blue planet Earth floating in space'),
  ],
  about: [
    // Tall photos in a wide banner: frame on the hands planting, the action of the shot.
    photo('people-planting', 1100, 1650, 'A group of people planting a young tree together', '50% 62%'),
    photo('hands-seedlings', 1100, 1650, 'Several hands holding young seedlings ready to plant', '50% 50%'),
    photo('group-planting', 1100, 1650, 'Friends of all ages planting a tree together outdoors', '50% 60%'),
    photo('volunteers-planting', 1600, 1067, 'Volunteers in raincoats planting young trees in a field'),
    photo('dune-planting', 1600, 1067, 'Volunteers planting trees across sandy dunes to restore the land'),
  ],
  insights: [
    photo('rainforest-river', 1600, 899, 'Aerial drone view of a river winding through rainforest', '50% 60%'),
    photo('river-canopy', 1100, 1375, 'A river cutting through dense rainforest canopy, seen from above'),
    photo('winding-river', 1100, 1375, 'A serpentine river through green forest, seen from the air', '50% 60%'),
    photo('rainforest-hills', 1600, 900, 'Rainforest-covered hills and a winding river from above'),
    photo('forest-canopy', 1300, 867, 'Dense green rainforest canopy seen from a drone'),
  ],
  contact: [
    photo('perth-evening', 1600, 1067, 'Perth city skyline lit up in the evening over Elizabeth Quay', '50% 55%'),
    photo('perth-night-reflections', 1600, 900, "Perth's skyline at night, its lights reflected in the water"),
    photo('perth-twilight', 1600, 900, 'Perth city skyline at twilight, reflected in the Swan River'),
    photo('perth-sunset', 1600, 900, 'Perth skyline at sunset with palm trees and waterfront reflections'),
    photo('perth-kings-park', 1600, 900, 'Perth skyline at sunset, seen from Kings Park'),
  ],
};

/** The photo picked for a page, or the page's first photo if none (or someone else's) is picked. */
export function pagePhoto(page: SitePage, id: string | undefined): PagePhoto {
  return PHOTO_OPTIONS[page].find((p) => p.id === id) ?? PHOTO_OPTIONS[page][0];
}
