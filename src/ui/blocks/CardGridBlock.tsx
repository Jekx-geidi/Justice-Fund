import Image from 'next/image';
import type { CardGridBlock } from '@/lib/content/types';
import { focalPointStyle } from './focalPoint';

export function CardGridBlockView({ block }: { block: CardGridBlock }) {
  return (
    <div>
      {block.heading && (
        <div className="block-cards-heading">
          <h2>{block.heading}</h2>
        </div>
      )}
      <div className="block-cards">
        {block.cards.map((card) => (
          <article className="block-card" key={card.id}>
            {card.image && (
              <div className="block-imagetext-media block-card-media">
                <Image
                  src={card.image.url}
                  alt={card.image.alt}
                  fill
                  sizes="(max-width: 699px) 90vw, 30vw"
                  style={focalPointStyle(card.image)}
                />
              </div>
            )}
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
