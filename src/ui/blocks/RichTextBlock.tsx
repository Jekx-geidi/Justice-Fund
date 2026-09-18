import type { RichTextBlock } from '@/lib/content/types';

/**
 * `body` is sanitised at save time (both `PUT /api/admin/content/draft` and
 * `PUT /api/admin/pages/:id` run it through sanitizeRichText before it's
 * ever persisted) — not re-sanitised here. This renderer is shared between
 * the public route (server) and the admin Live Draft Preview (client), and
 * `sanitize-html` is server-only; re-running it here would force the whole
 * block-rendering chain into the client bundle. The one gap this leaves:
 * while an admin is actively typing unsaved raw HTML into the rich-text
 * field, the preview renders it unsanitised — never persisted, and only
 * ever visible to that authenticated admin's own browser.
 */
export function RichTextBlockView({ block }: { block: RichTextBlock }) {
  return (
    <div className="block-richtext">
      {block.heading && <h2>{block.heading}</h2>}
      <div dangerouslySetInnerHTML={{ __html: block.body }} />
    </div>
  );
}
