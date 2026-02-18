import { sanitizeNoteContent } from './note.model';

describe('Note Model', () => {
  describe('sanitizeNoteContent', () => {
    it('should preserve safe HTML tags', () => {
      const input = '<b>Bold</b> <i>Italic</i> <em>Emphasis</em>';
      const result = sanitizeNoteContent(input);
      expect(result).toContain('<b>Bold</b>');
      expect(result).toContain('<i>Italic</i>');
      expect(result).toContain('<em>Emphasis</em>');
    });

    it('should preserve anchor tags with attributes', () => {
      const input = '<a href="https://example.com">Link</a>';
      const result = sanitizeNoteContent(input);
      expect(result).toContain('<a href="https://example.com">Link</a>');
    });

    it('should preserve paragraph and list tags', () => {
      const input = '<p>Para</p><ul><li>Item</li></ul><ol><li>Ordered</li></ol>';
      const result = sanitizeNoteContent(input);
      expect(result).toContain('<p>Para</p>');
      expect(result).toContain('<ul>');
      expect(result).toContain('<li>Item</li>');
      expect(result).toContain('<ol>');
    });

    it('should preserve br and span tags', () => {
      const input = 'Line 1<br>Line 2<span class="highlight">Highlighted</span>';
      const result = sanitizeNoteContent(input);
      expect(result).toContain('<br>');
      expect(result).toContain('<span class="highlight">Highlighted</span>');
    });

    it('should preserve strong and u tags', () => {
      const input = '<strong>Strong</strong> <u>Underline</u>';
      const result = sanitizeNoteContent(input);
      expect(result).toContain('<strong>Strong</strong>');
      expect(result).toContain('<u>Underline</u>');
    });

    it('should strip script tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = sanitizeNoteContent(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
      expect(result).toContain('alert("xss")');
      expect(result).toContain('Hello');
    });

    it('should strip iframe tags', () => {
      const input = '<iframe src="https://evil.com"></iframe>';
      const result = sanitizeNoteContent(input);
      expect(result).not.toContain('<iframe');
      expect(result).not.toContain('</iframe>');
    });

    it('should strip style tags', () => {
      const input = '<style>body { color: red; }</style><p>Content</p>';
      const result = sanitizeNoteContent(input);
      expect(result).not.toContain('<style>');
      expect(result).toContain('<p>Content</p>');
    });

    it('should strip div and form tags', () => {
      const input = '<div><form action="/hack"><p>Nested</p></form></div>';
      const result = sanitizeNoteContent(input);
      expect(result).not.toContain('<div>');
      expect(result).not.toContain('<form');
      expect(result).toContain('<p>Nested</p>');
    });

    it('should return empty string for empty input', () => {
      expect(sanitizeNoteContent('')).toBe('');
    });

    it('should return plain text unchanged', () => {
      const input = 'Just plain text with no HTML';
      expect(sanitizeNoteContent(input)).toBe(input);
    });
  });
});
