import { ArrowUpRight } from 'lucide-react';
import type { CtaBlock } from '@/lib/content/types';

export function CtaBlockView({ block }: { block: CtaBlock }) {
  return (
    <div className="block-cta">
      <h2>{block.heading}</h2>
      {block.body && <p>{block.body}</p>}
      {block.buttonLabel && block.buttonUrl && (
        <a className="button button-gold" href={block.buttonUrl}>
          {block.buttonLabel}
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}
