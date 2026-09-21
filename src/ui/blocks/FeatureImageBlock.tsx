import Image from 'next/image';
import type { FeatureImageBlock } from '@/lib/content/types';
import { focalPointStyle } from './focalPoint';

export function FeatureImageBlockView({ block }: { block: FeatureImageBlock }) {
  return (
    <figure className={`block-feature-image ${block.displayStyle === 'contained' ? 'contained' : ''}`.trim()}>
      <div className="block-feature-image-media">
        {block.image && (
          <Image
            src={block.image.url}
            alt={block.image.alt}
            fill
            sizes="(max-width: 699px) 100vw, 1200px"
            style={focalPointStyle(block.image)}
          />
        )}
      </div>
      {block.caption && <figcaption>{block.caption}</figcaption>}
    </figure>
  );
}
