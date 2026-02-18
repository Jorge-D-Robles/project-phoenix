/** Allowed HTML tags for content sanitization */
const ALLOWED_TAGS = new Set([
  'b', 'i', 'u', 'em', 'strong', 'a', 'br', 'p', 'ul', 'ol', 'li', 'span',
]);

/** Strip disallowed HTML tags while preserving allowed ones and their attributes */
export function sanitizeHtml(html: string): string {
  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tag: string) => {
    if (ALLOWED_TAGS.has(tag.toLowerCase())) {
      return match;
    }
    return '';
  });
}

/** Strip all HTML tags and truncate to a max length */
export function stripHtmlAndTruncate(html: string, maxLength: number): string {
  const text = html.replace(/<[^>]*>/g, '');
  if (text.length > maxLength) {
    return `${text.substring(0, maxLength)}...`;
  }
  return text;
}
