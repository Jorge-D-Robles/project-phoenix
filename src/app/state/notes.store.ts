import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

import { Note } from '../data/models/note.model';
import { NoteService } from '../data/note.service';

interface NotesState {
  notes: Note[];
  loading: boolean;
  error: string | null;
  selectedNoteId: string | null;
  filterLabel: string | null;
}

const initialState: NotesState = {
  notes: [],
  loading: false,
  error: null,
  selectedNoteId: null,
  filterLabel: null,
};

export const NotesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ notes, filterLabel, selectedNoteId }) => ({
    filteredNotes: computed(() => {
      const label = filterLabel();
      if (!label) return notes();
      return notes().filter(n => n.labels.includes(label));
    }),
    selectedNote: computed(() => {
      const id = selectedNoteId();
      if (!id) return null;
      return notes().find(n => n.id === id) ?? null;
    }),
    allLabels: computed(() => {
      const labels = new Set<string>();
      for (const note of notes()) {
        for (const label of note.labels) {
          labels.add(label);
        }
      }
      return [...labels].sort();
    }),
  })),
  withMethods((store, noteService = inject(NoteService)) => ({
    async loadNotes(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const notes = await firstValueFrom(noteService.listNotes());
        patchState(store, { notes, loading: false });
      } catch {
        patchState(store, { error: 'Failed to load notes', loading: false });
      }
    },

    async addNote(note: Omit<Note, 'id'>): Promise<void> {
      try {
        const created = await firstValueFrom(noteService.createNote(note));
        patchState(store, { notes: [...store.notes(), created], error: null });
      } catch {
        patchState(store, { error: 'Failed to create note' });
      }
    },

    async updateNote(id: string, updates: Partial<Omit<Note, 'id'>>): Promise<void> {
      const existing = store.notes().find(n => n.id === id);
      if (!existing) return;

      const { id: _id, ...existingData } = existing;
      const merged: Omit<Note, 'id'> = { ...existingData, ...updates };

      try {
        const updated = await firstValueFrom(noteService.updateNote(id, merged));
        patchState(store, {
          notes: store.notes().map(n => n.id === id ? updated : n),
          error: null,
        });
      } catch {
        patchState(store, { error: 'Failed to update note' });
      }
    },

    async removeNote(id: string): Promise<void> {
      try {
        await firstValueFrom(noteService.deleteNote(id));
        patchState(store, {
          notes: store.notes().filter(n => n.id !== id),
          error: null,
        });
      } catch {
        patchState(store, { error: 'Failed to delete note' });
      }
    },

    selectNote(id: string | null): void {
      patchState(store, { selectedNoteId: id });
    },

    setFilter(label: string | null): void {
      patchState(store, { filterLabel: label });
    },
  })),
);
