import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

import type { Note } from '../data/models/note.model';
import { NoteService } from '../data/note.service';

export type NoteTab = 'active' | 'archived';

interface NotesState {
  readonly notes: Note[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly selectedNoteId: string | null;
  readonly filterLabel: string | null;
  readonly searchQuery: string;
  readonly activeTab: NoteTab;
}

const initialState: NotesState = {
  notes: [],
  loading: false,
  error: null,
  selectedNoteId: null,
  filterLabel: null,
  searchQuery: '',
  activeTab: 'active',
};

export const NotesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ notes, filterLabel, selectedNoteId, searchQuery, activeTab }) => ({
    filteredNotes: computed(() => {
      const label = filterLabel();
      const query = searchQuery().toLowerCase().trim();
      const tab = activeTab();

      let result = notes().filter(n => tab === 'archived' ? (n.archived ?? false) : !(n.archived ?? false));

      if (label) {
        result = result.filter(n => n.labels.includes(label));
      }
      if (query) {
        result = result.filter(n =>
          n.title.toLowerCase().includes(query) ||
          n.content.toLowerCase().includes(query),
        );
      }
      // Pinned notes first
      return result.sort((a, b) => {
        const aPinned = a.pinned ?? false;
        const bPinned = b.pinned ?? false;
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return b.lastModified.localeCompare(a.lastModified);
      });
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
  withMethods((store, noteService = inject(NoteService)) => {
    async function optimisticNoteUpdate(
      id: string,
      changes: Partial<Note>,
      errorMsg: string,
    ): Promise<void> {
      const note = store.notes().find(n => n.id === id);
      if (!note) return;
      const updated = { ...note, ...changes, lastModified: new Date().toISOString() };
      patchState(store, {
        notes: store.notes().map(n => n.id === id ? updated : n),
        error: null,
      });
      const { id: _id, ...data } = updated;
      try {
        await firstValueFrom(noteService.updateNote(id, data));
      } catch {
        patchState(store, {
          notes: store.notes().map(n => n.id === id ? note : n),
          error: errorMsg,
        });
      }
    }

    return {
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

        const merged: Note = { ...existing, ...updates };
        const { id: _id, ...mergedData } = merged;

        patchState(store, {
          notes: store.notes().map(n => n.id === id ? merged : n),
          error: null,
        });

        try {
          await firstValueFrom(noteService.updateNote(id, mergedData));
        } catch {
          patchState(store, {
            notes: store.notes().map(n => n.id === id ? existing : n),
            error: 'Failed to update note',
          });
        }
      },

      async removeNote(id: string): Promise<void> {
        const previous = store.notes();
        patchState(store, {
          notes: previous.filter(n => n.id !== id),
          error: null,
        });
        try {
          await firstValueFrom(noteService.deleteNote(id));
        } catch {
          patchState(store, { notes: previous, error: 'Failed to delete note' });
        }
      },

      selectNote(id: string | null): void {
        patchState(store, { selectedNoteId: id });
      },

      setFilter(label: string | null): void {
        patchState(store, { filterLabel: label });
      },

      setSearchQuery(query: string): void {
        patchState(store, { searchQuery: query });
      },

      setActiveTab(tab: NoteTab): void {
        patchState(store, { activeTab: tab });
      },

      async togglePin(id: string): Promise<void> {
        const note = store.notes().find(n => n.id === id);
        if (!note) return;
        await optimisticNoteUpdate(id, { pinned: !(note.pinned ?? false) }, 'Failed to pin note');
      },

      async archiveNote(id: string): Promise<void> {
        await optimisticNoteUpdate(id, { archived: true }, 'Failed to archive note');
      },

      async unarchiveNote(id: string): Promise<void> {
        await optimisticNoteUpdate(id, { archived: false }, 'Failed to unarchive note');
      },
    };
  }),
);
