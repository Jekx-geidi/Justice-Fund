import Image from 'next/image';
import type { HeroBlock } from '@/lib/content/types';
import { focalPointStyle } from './focalPoint';

export function HeroBlockView({ block }: { block: HeroBlock }) {
  const alignment = block.alignment === 'center' ? 'align-center' : '';
  return (
    <div className={`block-hero ${alignment}`.trim()}>
      {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
      <h1>{block.heading}</h1>
      {block.body && <p className="lead">{block.body}</p>}
      {block.image && (
        <div className="block-imagetext-media block-hero-media">
          <Image
            src={block.image.url}
            alt={block.image.alt}
            fill
            sizes="(max-width: 699px) 90vw, 60vw"
            style={focalPointStyle(block.image)}
          />
        </div>
      )}
    </div>
  );
}
