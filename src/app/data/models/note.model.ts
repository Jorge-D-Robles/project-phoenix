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
const NOTE_COLOR_MAP: Record<NoteColor, string> = {
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

/** Resolve a NoteColor to its hex string */
export function getNoteColor(color: NoteColor): string {
  return NOTE_COLOR_MAP[color] ?? NOTE_COLOR_MAP['DEFAULT'];
}

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

// Re-export sanitizeHtml as sanitizeNoteContent for backwards compatibility
export { sanitizeHtml as sanitizeNoteContent } from '../../shared/sanitize-html.util';
