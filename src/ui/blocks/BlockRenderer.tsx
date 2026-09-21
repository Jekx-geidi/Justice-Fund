import type { ContentBlock } from '@/lib/content/types';
import { HeroBlockView } from './HeroBlock';
import { RichTextBlockView } from './RichTextBlock';
import { ImageTextBlockView } from './ImageTextBlock';
import { CardGridBlockView } from './CardGridBlock';
import { QuoteBlockView } from './QuoteBlock';
import { CtaBlockView } from './CtaBlock';
import { FeatureImageBlockView } from './FeatureImageBlock';
import { DividerBlockView } from './DividerBlock';

export function BlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <>
      {blocks.map((block) => (
        <section className="wrap section block-section" key={block.id}>
          {block.type === 'hero' && <HeroBlockView block={block} />}
          {block.type === 'richText' && <RichTextBlockView block={block} />}
          {block.type === 'imageText' && <ImageTextBlockView block={block} />}
          {block.type === 'cardGrid' && <CardGridBlockView block={block} />}
          {block.type === 'quote' && <QuoteBlockView block={block} />}
          {block.type === 'cta' && <CtaBlockView block={block} />}
          {block.type === 'featureImage' && <FeatureImageBlockView block={block} />}
          {block.type === 'divider' && <DividerBlockView />}
        </section>
      ))}
    </>
  );
}
