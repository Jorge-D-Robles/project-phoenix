import { TaskParser } from './task.parser';
import { TaskMeta } from './models/task.model';

describe('TaskParser', () => {
  describe('parse', () => {
    it('should extract meta from notes with delimiter', () => {
      const notes = 'User notes\n---PHOENIX_META---\n{"habitId":"abc-123","docLinks":["https://example.com"],"tags":["work"]}';
      const result = TaskParser.parse(notes);
      expect(result.userNotes).toBe('User notes');
      expect(result.meta).toEqual({
        habitId: 'abc-123',
        docLinks: ['https://example.com'],
        tags: ['work'],
      });
    });

    it('should return null meta when no delimiter present', () => {
      const result = TaskParser.parse('Plain notes');
      expect(result.userNotes).toBe('Plain notes');
      expect(result.meta).toBeNull();
    });

    it('should handle null notes input', () => {
      const result = TaskParser.parse(null);
      expect(result.userNotes).toBe('');
      expect(result.meta).toBeNull();
    });

    it('should handle undefined notes input', () => {
      const result = TaskParser.parse(undefined as unknown as string | null);
      expect(result.userNotes).toBe('');
      expect(result.meta).toBeNull();
    });

    it('should handle empty string notes', () => {
      const result = TaskParser.parse('');
      expect(result.userNotes).toBe('');
      expect(result.meta).toBeNull();
    });

    it('should handle notes with delimiter but empty meta', () => {
      const notes = 'User notes\n---PHOENIX_META---\n{}';
      const result = TaskParser.parse(notes);
      expect(result.userNotes).toBe('User notes');
      expect(result.meta).toEqual({});
    });

    it('should handle notes with delimiter but invalid JSON', () => {
      const notes = 'User notes\n---PHOENIX_META---\n{invalid json}';
      const result = TaskParser.parse(notes);
      expect(result.userNotes).toBe('User notes');
      expect(result.meta).toBeNull();
    });

    it('should handle notes with only the delimiter and no user text', () => {
      const notes = '\n---PHOENIX_META---\n{"tags":["solo"]}';
      const result = TaskParser.parse(notes);
      expect(result.userNotes).toBe('');
      expect(result.meta).toEqual({ tags: ['solo'] });
    });

    it('should handle multiline user notes before delimiter', () => {
      const notes = 'Line 1\nLine 2\nLine 3\n---PHOENIX_META---\n{"tags":["multi"]}';
      const result = TaskParser.parse(notes);
      expect(result.userNotes).toBe('Line 1\nLine 2\nLine 3');
      expect(result.meta).toEqual({ tags: ['multi'] });
    });

    it('should trim trailing whitespace from user notes', () => {
      const notes = 'User notes  \n  \n---PHOENIX_META---\n{"tags":["trim"]}';
      const result = TaskParser.parse(notes);
      expect(result.userNotes).toBe('User notes');
      expect(result.meta).toEqual({ tags: ['trim'] });
    });
  });

  describe('serialize', () => {
    it('should serialize meta back into notes field', () => {
      const meta: TaskMeta = { tags: ['work'] };
      const result = TaskParser.serialize('User notes', meta);
      expect(result).toBe('User notes\n---PHOENIX_META---\n{"tags":["work"]}');
    });

    it('should omit delimiter when meta is null', () => {
      const result = TaskParser.serialize('User notes', null);
      expect(result).toBe('User notes');
    });

    it('should omit delimiter when meta is undefined', () => {
      const result = TaskParser.serialize('User notes', undefined as unknown as TaskMeta | null);
      expect(result).toBe('User notes');
    });

    it('should handle empty user notes with meta', () => {
      const meta: TaskMeta = { habitId: 'abc' };
      const result = TaskParser.serialize('', meta);
      expect(result).toBe('\n---PHOENIX_META---\n{"habitId":"abc"}');
    });

    it('should handle empty user notes with no meta', () => {
      const result = TaskParser.serialize('', null);
      expect(result).toBe('');
    });

    it('should handle meta with all fields', () => {
      const meta: TaskMeta = {
        habitId: 'h-1',
        docLinks: ['https://docs.google.com/doc1'],
        tags: ['urgent', 'work'],
      };
      const result = TaskParser.serialize('My notes', meta);
      const parsed = TaskParser.parse(result);
      expect(parsed.userNotes).toBe('My notes');
      expect(parsed.meta).toEqual(meta);
    });

    it('should handle empty meta object', () => {
      const result = TaskParser.serialize('Notes', {});
      expect(result).toBe('Notes\n---PHOENIX_META---\n{}');
    });
  });

  describe('round-trip', () => {
    it('should survive parse → serialize → parse cycle', () => {
      const original = 'My task notes\n---PHOENIX_META---\n{"habitId":"h-1","tags":["daily"]}';
      const parsed = TaskParser.parse(original);
      const serialized = TaskParser.serialize(parsed.userNotes, parsed.meta);
      const reparsed = TaskParser.parse(serialized);
      expect(reparsed.userNotes).toBe(parsed.userNotes);
      expect(reparsed.meta).toEqual(parsed.meta);
    });

    it('should survive round-trip for notes without meta', () => {
      const original = 'Plain text notes';
      const parsed = TaskParser.parse(original);
      const serialized = TaskParser.serialize(parsed.userNotes, parsed.meta);
      const reparsed = TaskParser.parse(serialized);
      expect(reparsed.userNotes).toBe('Plain text notes');
      expect(reparsed.meta).toBeNull();
    });

    it('should survive round-trip for null notes', () => {
      const parsed = TaskParser.parse(null);
      const serialized = TaskParser.serialize(parsed.userNotes, parsed.meta);
      const reparsed = TaskParser.parse(serialized);
      expect(reparsed.userNotes).toBe('');
      expect(reparsed.meta).toBeNull();
    });
  });
});
