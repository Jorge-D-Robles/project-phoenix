/** Allowed note background color identifiers */
export type NoteColor =
  | 'DEFAULT'
  | 'RED'
  | 'ORANGE'
  | 'YELLOW'
  | 'GREEN'
  | 'TEAL'
  | 'BLUE'
  | 'PURPLE'
  | 'PINK'
  | 'BROWN'
  | 'GRAY';

/** All 11 supported note colors */
export const NOTE_COLORS: readonly NoteColor[] = [
  'DEFAULT', 'RED', 'ORANGE', 'YELLOW', 'GREEN',
  'TEAL', 'BLUE', 'PURPLE', 'PINK', 'BROWN', 'GRAY',
] as const;

/** Mapping of NoteColor to hex color string for display */
export const NOTE_COLOR_MAP: Record<NoteColor, string> = {
  DEFAULT: '#FFFFFF',
  RED:     '#F28B82',
  ORANGE:  '#FBBC04',
  YELLOW:  '#FFF475',
  GREEN:   '#CCFF90',
  TEAL:    '#A7FFEB',
  BLUE:    '#CBF0F8',
  PURPLE:  '#D7AEFB',
  PINK:    '#FDCFE8',
  BROWN:   '#E6C9A8',
  GRAY:    '#E8EAED',
};

/** Default note color when none is specified */
export const DEFAULT_NOTE_COLOR: NoteColor = 'DEFAULT';

/** A file attachment on a note */
export interface NoteAttachment {
  readonly fileId: string;
  readonly mimeType: string;
  readonly webViewLink: string;
}

/** Readonly Phoenix representation of a note stored in Google Drive */
export interface Note {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly labels: readonly string[];
  readonly color: NoteColor;
  readonly attachments: readonly NoteAttachment[];
  readonly pinned: boolean;
  readonly archived: boolean;
  readonly created: string;
  readonly lastModified: string;
}

/** Google Drive API file resource (minimal shape) */
export interface GoogleDriveFile {
  readonly id: string;
  readonly name: string;
  readonly mimeType: string;
}

/** Google Drive API files.list response */
export interface GoogleDriveFileList {
  readonly files?: GoogleDriveFile[];
}

/** Allowed HTML tags for note content sanitization */
const ALLOWED_TAGS = new Set([
  'b', 'i', 'u', 'em', 'strong', 'a', 'br', 'p', 'ul', 'ol', 'li', 'span',
]);

/** Strip disallowed HTML tags while preserving allowed ones and their attributes */
export function sanitizeNoteContent(html: string): string {
  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tag: string) => {
    if (ALLOWED_TAGS.has(tag.toLowerCase())) {
      return match;
    }
    return '';
  });
}
