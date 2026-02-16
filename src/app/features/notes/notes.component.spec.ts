import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
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
} = {}) {
  const store = jasmine.createSpyObj('NotesStore',
    ['loadNotes', 'addNote', 'updateNote', 'removeNote', 'selectNote', 'setFilter'],
    {
      notes: signal(overrides.notes ?? MOCK_NOTES),
      filteredNotes: signal(overrides.filteredNotes ?? overrides.notes ?? MOCK_NOTES),
      loading: signal(overrides.loading ?? false),
      error: signal(overrides.error ?? null),
      selectedNoteId: signal(overrides.selectedNoteId ?? null),
      selectedNote: signal(overrides.selectedNote ?? null),
      filterLabel: signal(overrides.filterLabel ?? null),
      allLabels: signal(overrides.allLabels ?? ['work', 'personal']),
    },
  );
  store.loadNotes.and.resolveTo();
  store.addNote.and.resolveTo();
  store.updateNote.and.resolveTo();
  store.removeNote.and.resolveTo();
  return store;
}

async function setup(storeOverrides: Parameters<typeof createMockStore>[0] = {}) {
  const mockStore = createMockStore(storeOverrides);

  await TestBed.configureTestingModule({
    imports: [NotesComponent],
    providers: [
      { provide: NotesStore, useValue: mockStore },
      provideNoopAnimations(),
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(NotesComponent);
  await fixture.whenStable();
  return { fixture, mockStore };
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
});
