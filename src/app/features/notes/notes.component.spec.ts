import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { NotesComponent } from './notes.component';
import { NotesStore } from '../../state/notes.store';
import type { Note } from '../../data/models/note.model';

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'n1',
    title: 'Test Note',
    content: '<p>Hello world</p>',
    labels: ['work'],
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
  makeNote({ id: 'n1', title: 'Work Note' }),
  makeNote({ id: 'n2', title: 'Personal Note', labels: ['personal'] }),
];

function createMockStore(overrides: {
  notes?: Note[];
  filteredNotes?: Note[];
  loading?: boolean;
  error?: string | null;
  selectedNoteId?: string | null;
  selectedNote?: Note | null;
  filterLabel?: string | null;
  allLabels?: string[];
  searchQuery?: string;
  activeTab?: string;
} = {}) {
  const store = jasmine.createSpyObj('NotesStore',
    ['loadNotes', 'addNote', 'updateNote', 'removeNote', 'selectNote', 'setFilter',
     'setSearchQuery', 'setActiveTab', 'togglePin', 'archiveNote', 'unarchiveNote'],
    {
      notes: signal(overrides.notes ?? MOCK_NOTES),
      filteredNotes: signal(overrides.filteredNotes ?? overrides.notes ?? MOCK_NOTES),
      loading: signal(overrides.loading ?? false),
      error: signal(overrides.error ?? null),
      selectedNoteId: signal(overrides.selectedNoteId ?? null),
      selectedNote: signal(overrides.selectedNote ?? null),
      filterLabel: signal(overrides.filterLabel ?? null),
      allLabels: signal(overrides.allLabels ?? ['work', 'personal']),
      searchQuery: signal(overrides.searchQuery ?? ''),
      activeTab: signal(overrides.activeTab ?? 'active'),
    },
  );
  store.loadNotes.and.resolveTo();
  store.addNote.and.resolveTo();
  store.updateNote.and.resolveTo();
  store.removeNote.and.resolveTo();
  store.togglePin.and.resolveTo();
  store.archiveNote.and.resolveTo();
  store.unarchiveNote.and.resolveTo();
  return store;
}

function createMockSnackBar() {
  const actionSubject = new Subject<void>();
  const snackBarRef = jasmine.createSpyObj('MatSnackBarRef', ['onAction', 'dismiss']);
  snackBarRef.onAction.and.returnValue(actionSubject.asObservable());
  const mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
  mockSnackBar.open.and.returnValue(snackBarRef);
  return { mockSnackBar, snackBarRef, actionSubject };
}

async function setup(storeOverrides: Parameters<typeof createMockStore>[0] = {}) {
  const mockStore = createMockStore(storeOverrides);
  const { mockSnackBar, snackBarRef, actionSubject } = createMockSnackBar();

  await TestBed.configureTestingModule({
    imports: [NotesComponent],
    providers: [
      { provide: NotesStore, useValue: mockStore },
      provideNoopAnimations(),
    ],
  })
  .overrideComponent(NotesComponent, {
    set: {
      providers: [
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    },
  })
  .compileComponents();

  const fixture = TestBed.createComponent(NotesComponent);
  await fixture.whenStable();
  return { fixture, mockStore, mockSnackBar, snackBarRef, actionSubject };
}

describe('NotesComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('initialization', () => {
    it('should call loadNotes on init', async () => {
      const { mockStore } = await setup();
      expect(mockStore.loadNotes).toHaveBeenCalled();
    });
  });

  describe('note grid', () => {
    it('should render note cards for each note', async () => {
      const { fixture } = await setup();
      const cards = fixture.debugElement.queryAll(By.css('app-note-card'));
      expect(cards.length).toBe(2);
    });

    it('should show empty state when no notes', async () => {
      const { fixture } = await setup({ filteredNotes: [] });
      const empty = fixture.debugElement.query(By.css('[data-testid="empty-state"]'));
      expect(empty).toBeTruthy();
    });
  });

  describe('loading state', () => {
    it('should show spinner when loading', async () => {
      const { fixture } = await setup({ loading: true });
      const spinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(spinner).toBeTruthy();
    });
  });

  describe('error state', () => {
    it('should show error message when error exists', async () => {
      const { fixture } = await setup({ error: 'Failed to load notes' });
      const error = fixture.debugElement.query(By.css('[data-testid="error-message"]'));
      expect(error).toBeTruthy();
      expect(error.nativeElement.textContent).toContain('Failed to load notes');
    });
  });

  describe('add note button', () => {
    it('should render an add note FAB', async () => {
      const { fixture } = await setup();
      const fab = fixture.debugElement.query(By.css('[data-testid="add-note-btn"]'));
      expect(fab).toBeTruthy();
    });
  });

  describe('delete note with snackbar undo', () => {
    it('should call removeNote and show snackbar when delete is triggered', async () => {
      const { fixture, mockStore, mockSnackBar } = await setup();
      const card = fixture.debugElement.query(By.css('app-note-card'));
      card.triggerEventHandler('delete', 'n1');
      await fixture.whenStable();

      expect(mockStore.removeNote).toHaveBeenCalledWith('n1');
      expect(mockSnackBar.open).toHaveBeenCalledWith('Note deleted', 'Undo', { duration: 5000 });
    });

    it('should not call removeNote when note id is not found in store.notes', async () => {
      // Override notes() to return empty so find() returns undefined
      const emptyStore = createMockStore({ notes: [], filteredNotes: MOCK_NOTES });
      const { mockSnackBar: snackBarMock } = createMockSnackBar();
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [NotesComponent],
        providers: [
          { provide: NotesStore, useValue: emptyStore },
          provideNoopAnimations(),
        ],
      })
      .overrideComponent(NotesComponent, {
        set: { providers: [{ provide: MatSnackBar, useValue: snackBarMock }] },
      })
      .compileComponents();
      const f = TestBed.createComponent(NotesComponent);
      await f.whenStable();
      // filteredNotes has notes, so cards render; but notes() is empty so find returns undefined
      const card = f.debugElement.query(By.css('app-note-card'));
      card.triggerEventHandler('delete', 'n1');
      await f.whenStable();

      expect(emptyStore.removeNote).not.toHaveBeenCalled();
      expect(snackBarMock.open).not.toHaveBeenCalled();
    });

    it('should call addNote with note data when undo action is triggered', async () => {
      const { fixture, mockStore, actionSubject } = await setup();
      const card = fixture.debugElement.query(By.css('app-note-card'));
      card.triggerEventHandler('delete', 'n1');
      await fixture.whenStable();

      // Simulate clicking Undo
      actionSubject.next();
      await fixture.whenStable();

      expect(mockStore.addNote).toHaveBeenCalledWith(jasmine.objectContaining({
        title: 'Work Note',
        content: '<p>Hello world</p>',
        color: 'BLUE',
        pinned: false,
        archived: false,
      }));
    });
  });
});
