import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { NotesStore } from './notes.store';
import { NoteService } from '../data/note.service';
import type { Note } from '../data/models/note.model';

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'file-1',
    title: 'Test Note',
    content: '<p>Hello world</p>',
    labels: ['work', 'important'],
    color: 'BLUE',
    attachments: [],
    pinned: false,
    archived: false,
    created: '2026-02-16T10:00:00Z',
    lastModified: '2026-02-16T12:00:00Z',
    ...overrides,
  };
}

const MOCK_NOTES: Note[] = [
  makeNote({ id: 'n1', title: 'Work Note', labels: ['work'] }),
  makeNote({ id: 'n2', title: 'Personal Note', labels: ['personal', 'important'] }),
  makeNote({ id: 'n3', title: 'Shared Labels', labels: ['work', 'important'] }),
];

describe('NotesStore', () => {
  let store: InstanceType<typeof NotesStore>;
  let mockNoteService: jasmine.SpyObj<NoteService>;

  beforeEach(() => {
    mockNoteService = jasmine.createSpyObj('NoteService', [
      'listNotes', 'getNote', 'createNote', 'updateNote', 'deleteNote',
    ]);
    mockNoteService.listNotes.and.returnValue(of(MOCK_NOTES));

    TestBed.configureTestingModule({
      providers: [
        NotesStore,
        { provide: NoteService, useValue: mockNoteService },
      ],
    });

    store = TestBed.inject(NotesStore);
  });

  describe('initial state', () => {
    it('should have empty notes array', () => {
      expect(store.notes()).toEqual([]);
    });

    it('should not be loading', () => {
      expect(store.loading()).toBe(false);
    });

    it('should have null error', () => {
      expect(store.error()).toBeNull();
    });

    it('should have null selectedNoteId', () => {
      expect(store.selectedNoteId()).toBeNull();
    });

    it('should have null filterLabel', () => {
      expect(store.filterLabel()).toBeNull();
    });
  });

  describe('computed: filteredNotes', () => {
    it('should return all notes when filterLabel is null', async () => {
      await store.loadNotes();
      expect(store.filteredNotes().length).toBe(3);
    });

    it('should filter notes by label', async () => {
      await store.loadNotes();
      store.setFilter('work');
      expect(store.filteredNotes().length).toBe(2);
      expect(store.filteredNotes().every(n => n.labels.includes('work'))).toBeTrue();
    });

    it('should return empty array when no notes match the filter', async () => {
      await store.loadNotes();
      store.setFilter('nonexistent');
      expect(store.filteredNotes().length).toBe(0);
    });

    it('should update reactively when filter changes', async () => {
      await store.loadNotes();
      expect(store.filteredNotes().length).toBe(3);

      store.setFilter('personal');
      expect(store.filteredNotes().length).toBe(1);
      expect(store.filteredNotes()[0].title).toBe('Personal Note');

      store.setFilter(null);
      expect(store.filteredNotes().length).toBe(3);
    });
  });

  describe('computed: selectedNote', () => {
    it('should return null when no note is selected', async () => {
      await store.loadNotes();
      expect(store.selectedNote()).toBeNull();
    });

    it('should return the matching note when selectedNoteId is set', async () => {
      await store.loadNotes();
      store.selectNote('n2');
      expect(store.selectedNote()).toBeTruthy();
      expect(store.selectedNote()!.title).toBe('Personal Note');
    });

    it('should return null when selectedNoteId does not match any note', async () => {
      await store.loadNotes();
      store.selectNote('nonexistent');
      expect(store.selectedNote()).toBeNull();
    });
  });

  describe('computed: allLabels', () => {
    it('should return empty array when no notes loaded', () => {
      expect(store.allLabels()).toEqual([]);
    });

    it('should return deduplicated sorted labels from all notes', async () => {
      await store.loadNotes();
      expect(store.allLabels()).toEqual(['important', 'personal', 'work']);
    });
  });

  describe('method: loadNotes', () => {
    it('should set loading while fetching', async () => {
      const promise = store.loadNotes();
      expect(store.loading()).toBe(true);
      await promise;
      expect(store.loading()).toBe(false);
    });

    it('should store fetched notes', async () => {
      await store.loadNotes();
      expect(store.notes().length).toBe(3);
      expect(mockNoteService.listNotes).toHaveBeenCalled();
    });

    it('should clear error on success', async () => {
      mockNoteService.listNotes.and.returnValue(throwError(() => new Error('fail')));
      await store.loadNotes();
      expect(store.error()).toBe('Failed to load notes');

      mockNoteService.listNotes.and.returnValue(of(MOCK_NOTES));
      await store.loadNotes();
      expect(store.error()).toBeNull();
    });

    it('should set error on failure', async () => {
      mockNoteService.listNotes.and.returnValue(throwError(() => new Error('Network error')));
      await store.loadNotes();
      expect(store.error()).toBe('Failed to load notes');
      expect(store.loading()).toBe(false);
    });
  });

  describe('method: addNote', () => {
    const newNote: Note = makeNote({ id: 'n-new', title: 'New Note', labels: ['fresh'] });

    beforeEach(async () => {
      await store.loadNotes();
      mockNoteService.createNote.and.returnValue(of(newNote));
    });

    it('should add the created note to the store', async () => {
      const { id, ...noteData } = newNote;
      await store.addNote(noteData);
      expect(store.notes().length).toBe(4);
      expect(store.notes().find(n => n.id === 'n-new')).toBeTruthy();
    });

    it('should call createNote on the service', async () => {
      const { id, ...noteData } = newNote;
      await store.addNote(noteData);
      expect(mockNoteService.createNote).toHaveBeenCalledWith(noteData);
    });

    it('should set error on failure', async () => {
      mockNoteService.createNote.and.returnValue(throwError(() => new Error('fail')));
      const { id, ...noteData } = newNote;
      await store.addNote(noteData);
      expect(store.error()).toBe('Failed to create note');
    });
  });

  describe('method: updateNote', () => {
    const updatedNote: Note = makeNote({ id: 'n1', title: 'Updated Work Note', labels: ['work', 'updated'] });

    beforeEach(async () => {
      await store.loadNotes();
      mockNoteService.updateNote.and.returnValue(of(updatedNote));
    });

    it('should replace the note in the store', async () => {
      await store.updateNote('n1', { title: 'Updated Work Note', labels: ['work', 'updated'] });
      expect(store.notes().find(n => n.id === 'n1')?.title).toBe('Updated Work Note');
    });

    it('should not change other notes', async () => {
      await store.updateNote('n1', { title: 'Updated Work Note' });
      expect(store.notes().find(n => n.id === 'n2')?.title).toBe('Personal Note');
    });

    it('should merge partial updates with existing note data', async () => {
      await store.updateNote('n1', { title: 'Updated Work Note' });
      expect(mockNoteService.updateNote).toHaveBeenCalledWith(
        'n1',
        jasmine.objectContaining({ title: 'Updated Work Note', content: '<p>Hello world</p>' }),
      );
    });

    it('should optimistically update the note before API call completes', async () => {
      // Note is updated immediately even before the API resolves
      const updatePromise = store.updateNote('n1', { title: 'Optimistic Title' });
      expect(store.notes().find(n => n.id === 'n1')?.title).toBe('Optimistic Title');
      await updatePromise;
    });

    it('should set error and rollback on failure', async () => {
      mockNoteService.updateNote.and.returnValue(throwError(() => new Error('fail')));
      await store.updateNote('n1', { title: 'Fail' });
      expect(store.error()).toBe('Failed to update note');
      // Should rollback to original note
      expect(store.notes().find(n => n.id === 'n1')?.title).toBe('Work Note');
    });
  });

  describe('method: removeNote', () => {
    beforeEach(async () => {
      await store.loadNotes();
      mockNoteService.deleteNote.and.returnValue(of(void 0));
    });

    it('should remove the note from the store', async () => {
      await store.removeNote('n1');
      expect(store.notes().length).toBe(2);
      expect(store.notes().find(n => n.id === 'n1')).toBeUndefined();
    });

    it('should call deleteNote on the service', async () => {
      await store.removeNote('n1');
      expect(mockNoteService.deleteNote).toHaveBeenCalledWith('n1');
    });

    it('should optimistically remove the note before API call completes', async () => {
      const removePromise = store.removeNote('n1');
      expect(store.notes().find(n => n.id === 'n1')).toBeUndefined();
      expect(store.notes().length).toBe(2);
      await removePromise;
    });

    it('should set error and rollback on failure', async () => {
      mockNoteService.deleteNote.and.returnValue(throwError(() => new Error('fail')));
      await store.removeNote('n1');
      expect(store.error()).toBe('Failed to delete note');
      // Should rollback — note is restored
      expect(store.notes().find(n => n.id === 'n1')).toBeTruthy();
      expect(store.notes().length).toBe(3);
    });
  });

  describe('method: selectNote', () => {
    it('should set selectedNoteId', () => {
      store.selectNote('n1');
      expect(store.selectedNoteId()).toBe('n1');
    });

    it('should accept null to deselect', () => {
      store.selectNote('n1');
      store.selectNote(null);
      expect(store.selectedNoteId()).toBeNull();
    });
  });

  describe('method: setFilter', () => {
    it('should set filterLabel', () => {
      store.setFilter('work');
      expect(store.filterLabel()).toBe('work');
    });

    it('should accept null to clear filter', () => {
      store.setFilter('work');
      store.setFilter(null);
      expect(store.filterLabel()).toBeNull();
    });
  });
});
