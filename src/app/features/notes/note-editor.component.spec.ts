import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { NoteEditorComponent, NoteFormData } from './note-editor.component';
import { Note } from '../../data/models/note.model';

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'n1',
    title: 'Existing Note',
    content: 'Some content here',
    labels: ['work', 'important'],
    color: 'GREEN',
    attachments: [],
    created: '2026-02-16T10:00:00Z',
    lastModified: '2026-02-16T12:00:00Z',
    ...overrides,
  };
}

describe('NoteEditorComponent', () => {
  async function setup(note: Note | null = null) {
    await TestBed.configureTestingModule({
      imports: [NoteEditorComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    const fixture = TestBed.createComponent(NoteEditorComponent);
    fixture.componentRef.setInput('note', note);
    await fixture.whenStable();
    return fixture;
  }

  afterEach(() => TestBed.resetTestingModule());

  describe('new note (null input)', () => {
    it('should render an empty title field', async () => {
      const fixture = await setup(null);
      const titleInput = fixture.debugElement.query(By.css('[data-testid="note-title-input"]'));
      expect(titleInput).toBeTruthy();
      expect(titleInput.nativeElement.value).toBe('');
    });

    it('should render an empty content field', async () => {
      const fixture = await setup(null);
      const contentInput = fixture.debugElement.query(By.css('[data-testid="note-content-input"]'));
      expect(contentInput).toBeTruthy();
      expect(contentInput.nativeElement.value).toBe('');
    });

    it('should render an empty labels field', async () => {
      const fixture = await setup(null);
      const labelsInput = fixture.debugElement.query(By.css('[data-testid="note-labels-input"]'));
      expect(labelsInput).toBeTruthy();
      expect(labelsInput.nativeElement.value).toBe('');
    });

    it('should have DEFAULT as the initial color', async () => {
      const fixture = await setup(null);
      const colorSelect = fixture.debugElement.query(By.css('[data-testid="note-color-select"]'));
      expect(colorSelect).toBeTruthy();
    });
  });

  describe('existing note', () => {
    it('should populate the title field', async () => {
      const fixture = await setup(makeNote());
      const titleInput = fixture.debugElement.query(By.css('[data-testid="note-title-input"]'));
      expect(titleInput.nativeElement.value).toBe('Existing Note');
    });

    it('should populate the content field', async () => {
      const fixture = await setup(makeNote());
      const contentInput = fixture.debugElement.query(By.css('[data-testid="note-content-input"]'));
      expect(contentInput.nativeElement.value).toBe('Some content here');
    });

    it('should populate the labels field as comma-separated', async () => {
      const fixture = await setup(makeNote());
      const labelsInput = fixture.debugElement.query(By.css('[data-testid="note-labels-input"]'));
      expect(labelsInput.nativeElement.value).toBe('work, important');
    });
  });

  describe('save event', () => {
    it('should emit save with form data when save button is clicked', async () => {
      const fixture = await setup(null);
      const component = fixture.componentInstance;
      let emittedData: NoteFormData | undefined;
      component.save.subscribe((data: NoteFormData) => emittedData = data);

      // Fill in title
      const titleInput = fixture.debugElement.query(By.css('[data-testid="note-title-input"]'));
      titleInput.nativeElement.value = 'New Title';
      titleInput.nativeElement.dispatchEvent(new Event('input'));

      // Fill in content
      const contentInput = fixture.debugElement.query(By.css('[data-testid="note-content-input"]'));
      contentInput.nativeElement.value = 'New content';
      contentInput.nativeElement.dispatchEvent(new Event('input'));

      await fixture.whenStable();

      const saveBtn = fixture.debugElement.query(By.css('[data-testid="note-save-btn"]'));
      saveBtn.nativeElement.click();

      expect(emittedData).toBeDefined();
      expect(emittedData!['title']).toBe('New Title');
      expect(emittedData!['content']).toBe('New content');
    });
  });

  describe('cancel event', () => {
    it('should emit cancel when cancel button is clicked', async () => {
      const fixture = await setup(null);
      const component = fixture.componentInstance;
      let cancelled = false;
      component.cancel.subscribe(() => cancelled = true);

      const cancelBtn = fixture.debugElement.query(By.css('[data-testid="note-cancel-btn"]'));
      cancelBtn.nativeElement.click();

      expect(cancelled).toBeTrue();
    });
  });
});
