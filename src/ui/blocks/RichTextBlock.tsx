import type { RichTextBlock } from '@/lib/content/types';
import { sanitizeRichText } from '@/lib/security/sanitize';

export function RichTextBlockView({ block }: { block: RichTextBlock }) {
  return (
    <div className="block-richtext">
      {block.heading && <h2>{block.heading}</h2>}
      {/* Sanitised again at render time as defense-in-depth (Admin.md §21). */}
      <div dangerouslySetInnerHTML={{ __html: sanitizeRichText(block.body) }} />
    </div>
  );
}
