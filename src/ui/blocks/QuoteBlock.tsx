import type { QuoteBlockContent } from '@/lib/content/types';

export function QuoteBlockView({ block }: { block: QuoteBlockContent }) {
  return (
    <figure className="block-quote">
      <span className="quote-symbol" aria-hidden="true">
        &ldquo;
      </span>
      <blockquote>{block.quote}</blockquote>
      {block.attribution && <figcaption>{block.attribution}</figcaption>}
    </figure>
  );
}
