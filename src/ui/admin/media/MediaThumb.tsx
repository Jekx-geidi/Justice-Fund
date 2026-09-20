import Image from 'next/image';
import type { MediaItem } from '@/lib/media/types';

/** Shared thumbnail: lazy-loaded, capped to a small `sizes` hint, and previews the item's own focal point. */
export function MediaThumb({ item, sizes = '200px' }: { item: MediaItem; sizes?: string }) {
  return (
    <Image
      src={item.url}
      alt={item.altText}
      fill
      sizes={sizes}
      loading="lazy"
      className="object-cover"
      style={{ objectPosition: `${item.focalX * 100}% ${item.focalY * 100}%` }}
    />
  );
}
