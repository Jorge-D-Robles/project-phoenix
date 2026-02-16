import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoteCardComponent } from './note-card.component';
import type { Note } from '../../data/models/note.model';

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'n1',
    title: 'Test Note',
    content: '<p>Short content for preview</p>',
    labels: ['work', 'important'],
    color: 'BLUE',
    attachments: [],
    created: '2026-02-16T10:00:00Z',
    lastModified: '2026-02-16T12:00:00Z',
    ...overrides,
  };
}

describe('NoteCardComponent', () => {
  async function setup(note: Note = makeNote()) {
    await TestBed.configureTestingModule({
      imports: [NoteCardComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(NoteCardComponent);
    fixture.componentRef.setInput('note', note);
    await fixture.whenStable();
    return fixture;
  }

  afterEach(() => TestBed.resetTestingModule());

  describe('rendering', () => {
    it('should display the note title', async () => {
      const fixture = await setup();
      const title = fixture.debugElement.query(By.css('[data-testid="note-title"]'));
      expect(title).toBeTruthy();
      expect(title.nativeElement.textContent).toContain('Test Note');
    });

    it('should display a content preview', async () => {
      const fixture = await setup();
      const preview = fixture.debugElement.query(By.css('[data-testid="note-preview"]'));
      expect(preview).toBeTruthy();
      expect(preview.nativeElement.textContent).toContain('Short content for preview');
    });

    it('should truncate long content in the preview', async () => {
      const longContent = 'A'.repeat(300);
      const fixture = await setup(makeNote({ content: longContent }));
      const preview = fixture.debugElement.query(By.css('[data-testid="note-preview"]'));
      expect(preview.nativeElement.textContent.length).toBeLessThan(250);
    });

    it('should apply the note color as background', async () => {
      const fixture = await setup(makeNote({ color: 'BLUE' }));
      const card = fixture.debugElement.query(By.css('[data-testid="note-card"]'));
      expect(card.nativeElement.style.backgroundColor).toBeTruthy();
    });

    it('should render label chips', async () => {
      const fixture = await setup();
      const chips = fixture.debugElement.queryAll(By.css('[data-testid="note-label"]'));
      expect(chips.length).toBe(2);
      expect(chips[0].nativeElement.textContent).toContain('work');
      expect(chips[1].nativeElement.textContent).toContain('important');
    });

    it('should not render label chips when no labels', async () => {
      const fixture = await setup(makeNote({ labels: [] }));
      const chips = fixture.debugElement.queryAll(By.css('[data-testid="note-label"]'));
      expect(chips.length).toBe(0);
    });

    it('should show placeholder when title is empty', async () => {
      const fixture = await setup(makeNote({ title: '' }));
      const title = fixture.debugElement.query(By.css('[data-testid="note-title"]'));
      expect(title.nativeElement.textContent.trim()).toBeTruthy();
    });
  });

  describe('events', () => {
    it('should emit select event when card is clicked', async () => {
      const fixture = await setup();
      const component = fixture.componentInstance;
      let emitted = false;
      component.select.subscribe(() => emitted = true);

      const card = fixture.debugElement.query(By.css('[data-testid="note-card"]'));
      card.nativeElement.click();

      expect(emitted).toBeTrue();
    });

    it('should emit delete event when delete button is clicked', async () => {
      const fixture = await setup();
      const component = fixture.componentInstance;
      let emitted = false;
      component.delete.subscribe(() => emitted = true);

      const deleteBtn = fixture.debugElement.query(By.css('[data-testid="note-delete"]'));
      expect(deleteBtn).toBeTruthy();
      deleteBtn.nativeElement.click();

      expect(emitted).toBeTrue();
    });

    it('should not emit select when delete button is clicked', async () => {
      const fixture = await setup();
      const component = fixture.componentInstance;
      let selectEmitted = false;
      component.select.subscribe(() => selectEmitted = true);

      const deleteBtn = fixture.debugElement.query(By.css('[data-testid="note-delete"]'));
      deleteBtn.nativeElement.click();

      expect(selectEmitted).toBeFalse();
    });
  });
});
