import Image from 'next/image';
import type { ImageTextBlock } from '@/lib/content/types';
import { focalPointStyle } from './focalPoint';

export function ImageTextBlockView({ block }: { block: ImageTextBlock }) {
  return (
    <div className={`block-imagetext ${block.imageSide === 'right' ? 'image-right' : ''}`.trim()}>
      <div className="block-imagetext-media">
        {block.image && (
          <Image
            src={block.image.url}
            alt={block.image.alt}
            fill
            sizes="(max-width: 699px) 90vw, 45vw"
            style={focalPointStyle(block.image)}
          />
        )}
      </div>
      <div>
        <h2>{block.heading}</h2>
        <p>{block.body}</p>
      </div>
    </div>
  );
}
