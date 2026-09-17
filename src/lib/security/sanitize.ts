import 'server-only';
import sanitizeHtml from 'sanitize-html';

/**
 * Rich text allow-list (Admin.md 21). Anything not explicitly allowed here
 * — scripts, event handlers, style injection, iframes, javascript: URLs —
 * is stripped.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'h2', 'h3', 'h4', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'br'],
  allowedAttributes: {
    a: ['href', 'rel', 'target'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
  },
};

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, OPTIONS);
}
