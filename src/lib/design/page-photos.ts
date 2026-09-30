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
 * each). The first is the page default. All free under the Pexels or Unsplash License; photographers and sources are in
 * public/images/pages/CREDITS.md. A replacement photo needs a new file name: next/image and the CDN cache by URL.
 */
export const PHOTO_OPTIONS: Record<SitePage, PagePhoto[]> = {
  home: [
    // April searched "earth from space clouds": all five are cloud views from orbit, not whole globes.
    photo('earth-clouds', 1600, 900, 'Earth seen from space, with swirling clouds over the ocean'),
    photo('earth-australia-clouds', 1600, 900, 'Australia from space under swirling white clouds'),
    photo('earth-europe-clouds', 1600, 900, 'Europe from space with clouds over the land and sea'),
    photo('earth-storm-horizon', 1600, 1091, "A storm's spiral of clouds over Earth's curved horizon, seen from orbit"),
    photo('earth-hurricane', 1600, 1622, 'A hurricane of white clouds over the ocean, seen from space', '50% 55%'),
  ],
  about: [
    // April: people working in a rainforest or nature. Rainforest first; tall photos framed on the work in hand.
    photo('forest-planting', 1100, 1650, 'People planting young trees in a forest', '50% 70%'),
    photo('sierra-leone-planting', 1600, 1065, 'A woman and man planting trees among forest greenery in Sierra Leone'),
    photo('jungle-field-notes', 1100, 1649, 'A field researcher crouched in the jungle, writing notes in a notebook', '50% 45%'),
    photo('people-planting', 1100, 1650, 'A group of people planting a young tree together', '50% 62%'),
    photo('hands-seedlings', 1100, 1650, 'Several hands holding young seedlings ready to plant', '50% 50%'),
  ],
  insights: [
    photo('rainforest-river', 1600, 899, 'Aerial drone view of a river winding through rainforest', '50% 60%'),
    photo('river-canopy', 1100, 1375, 'A river cutting through dense rainforest canopy, seen from above'),
    photo('winding-river', 1100, 1375, 'A serpentine river through green forest, seen from the air', '50% 60%'),
    photo('rainforest-hills', 1600, 900, 'Rainforest-covered hills and a winding river from above'),
    photo('forest-canopy', 1300, 867, 'Dense green rainforest canopy seen from a drone'),
  ],
  contact: [
    // April: Perth city at night, so no daytime, dusk or sunset shots.
    photo('perth-skyline-night', 1600, 1067, "Perth's city skyline at night, its lights reflected in the Swan River"),
    photo('elizabeth-quay-night', 1100, 1650, 'Elizabeth Quay and the Perth skyline lit up at night', '50% 55%'),
    photo('elizabeth-quay-bridge-night', 1600, 1060, 'The Elizabeth Quay bridge glowing at night in Perth'),
    photo('kings-park-night', 1600, 1066, 'Perth city lights at night, seen from Kings Park'),
    photo('perth-night-reflections', 1600, 900, "Perth's skyline at night, its lights reflected in the water"),
  ],
};

/** How a page's photo sits: position in % (dragged on the page), zoom 100-250%, opacity 20-100%. */
export type PhotoFrame = { x: number; y: number; zoom: number; opacity: number };

/** A photo's own best framing: its object-position, normal size, fully opaque. */
export function defaultFrame(photo: PagePhoto): PhotoFrame {
  const [x, y] = photo.position.split(' ').map((v) => Math.round(parseFloat(v)));
  return { x, y, zoom: 100, opacity: 100 };
}

/** The photo picked for a page, or the page's first photo if none (or someone else's) is picked. */
export function pagePhoto(page: SitePage, id: string | undefined): PagePhoto {
  return PHOTO_OPTIONS[page].find((p) => p.id === id) ?? PHOTO_OPTIONS[page][0];
}
