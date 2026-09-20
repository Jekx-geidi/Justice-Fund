import type { MediaReference } from '@/lib/content/types';

/** `object-position` from a media reference's stored focal point — omitted falls back to the design's own default centring. */
export function focalPointStyle(image: Pick<MediaReference, 'focalX' | 'focalY'> | null | undefined): React.CSSProperties | undefined {
  if (image?.focalX == null || image?.focalY == null) return undefined;
  return { objectPosition: `${image.focalX * 100}% ${image.focalY * 100}%` };
}
