import type { ParsedTaskNotes, TaskMeta } from './models/task.model';

const DELIMITER = '\n---PHOENIX_META---\n';

export class TaskParser {
  static parse(notes: string | null): ParsedTaskNotes {
    if (!notes) {
      return { userNotes: '', meta: null };
    }

    const delimiterIndex = notes.indexOf(DELIMITER);

    if (delimiterIndex === -1) {
      return { userNotes: notes, meta: null };
    }

    const userNotes = notes.substring(0, delimiterIndex).trimEnd();
    const jsonString = notes.substring(delimiterIndex + DELIMITER.length);

    let meta: TaskMeta | null = null;
    try {
      meta = JSON.parse(jsonString) as TaskMeta;
    } catch {
      meta = null;
    }

    return { userNotes, meta };
  }

  static serialize(userNotes: string, meta: TaskMeta | null | undefined): string {
    if (!meta) {
      return userNotes;
    }

    return userNotes + DELIMITER + JSON.stringify(meta);
  }
}
