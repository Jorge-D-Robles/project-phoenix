import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';

import { NotesStore } from './notes.store';
import { todayDateKey } from '../shared/date.utils';
import type { Note } from '../data/models/note.model';

interface JournalState {
  readonly loading: boolean;
  readonly error: string | null;
}

const initialState: JournalState = {
  loading: false,
  error: null,
};

function journalTitle(date: string): string {
  return `Journal — ${date}`;
}

export const JournalStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((_state, notesStore = inject(NotesStore)) => ({
    allEntries: computed((): Note[] => {
      return notesStore.notes()
        .filter(n => n.labels.includes('journal'))
        .sort((a, b) => b.title.localeCompare(a.title));
    }),

    todayEntry: computed((): Note | null => {
      const today = todayDateKey();
      const title = journalTitle(today);
      return notesStore.notes().find(
        n => n.labels.includes('journal') && n.title === title,
      ) ?? null;
    }),

    recentEntries: computed((): Note[] => {
      return notesStore.notes()
        .filter(n => n.labels.includes('journal'))
        .sort((a, b) => b.title.localeCompare(a.title))
        .slice(0, 7);
    }),
  })),
  withMethods((store, notesStore = inject(NotesStore)) => ({
    async ensureTodayEntry(): Promise<Note> {
      const existing = store.todayEntry();
      if (existing) return existing;

      const today = todayDateKey();
      const newNote: Omit<Note, 'id'> = {
        title: journalTitle(today),
        content: '',
        labels: ['journal'],
        color: 'DEFAULT',
        attachments: [],
        pinned: false,
        archived: false,
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      patchState(store, { loading: true, error: null });
      try {
        await notesStore.addNote(newNote);
        patchState(store, { loading: false });
        return store.todayEntry()!;
      } catch {
        patchState(store, { error: 'Failed to create journal entry', loading: false });
        throw new Error('Failed to create journal entry');
      }
    },

    async updateEntry(id: string, content: string): Promise<void> {
      patchState(store, { error: null });
      try {
        await notesStore.updateNote(id, { content });
      } catch {
        patchState(store, { error: 'Failed to update journal entry' });
      }
    },
  })),
);
