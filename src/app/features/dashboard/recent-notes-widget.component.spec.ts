import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RecentNotesWidgetComponent } from './recent-notes-widget.component';
import type { Note } from '../../data/models/note.model';

const MOCK_NOTES: Note[] = [
  {
    id: 'n1', title: 'Meeting notes', content: '<p>Discussed roadmap</p>',
    labels: ['work'], color: 'BLUE', attachments: [], pinned: false, archived: false,
    created: '2026-02-16T00:00:00Z', lastModified: '2026-02-16T12:00:00Z',
  },
  {
    id: 'n2', title: 'Shopping list', content: 'Milk, bread, eggs',
    labels: [], color: 'YELLOW', attachments: [], pinned: false, archived: false,
    created: '2026-02-15T00:00:00Z', lastModified: '2026-02-15T12:00:00Z',
  },
];

describe('RecentNotesWidgetComponent', () => {
  async function setup(notes: Note[] = MOCK_NOTES) {
    await TestBed.configureTestingModule({
      imports: [RecentNotesWidgetComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    const fixture = TestBed.createComponent(RecentNotesWidgetComponent);
    fixture.componentRef.setInput('notes', notes);
    await fixture.whenStable();
    return fixture;
  }

  afterEach(() => TestBed.resetTestingModule());

  describe('rendering', () => {
    it('should render the recent notes card', async () => {
      const fixture = await setup();
      const card = fixture.debugElement.query(By.css('[data-testid="recent-notes-card"]'));
      expect(card).toBeTruthy();
    });

    it('should render a note item for each note', async () => {
      const fixture = await setup();
      const items = fixture.debugElement.queryAll(By.css('[data-testid="note-item"]'));
      expect(items.length).toBe(2);
    });

    it('should display note titles', async () => {
      const fixture = await setup();
      const titles = fixture.debugElement.queryAll(By.css('[data-testid="note-title"]'));
      expect(titles[0].nativeElement.textContent).toContain('Meeting notes');
      expect(titles[1].nativeElement.textContent).toContain('Shopping list');
    });

    it('should display content preview stripped of HTML', async () => {
      const fixture = await setup();
      const previews = fixture.debugElement.queryAll(By.css('[data-testid="note-preview"]'));
      expect(previews[0].nativeElement.textContent).toContain('Discussed roadmap');
    });

    it('should apply note color as background', async () => {
      const fixture = await setup();
      const items = fixture.debugElement.queryAll(By.css('[data-testid="note-item"]'));
      expect(items[0].nativeElement.style.backgroundColor).toBeTruthy();
    });

    it('should show Untitled for notes with empty title', async () => {
      const fixture = await setup([{ ...MOCK_NOTES[0], title: '' }]);
      const titles = fixture.debugElement.queryAll(By.css('[data-testid="note-title"]'));
      expect(titles[0].nativeElement.textContent).toContain('Untitled');
    });

    it('should show empty state when no notes', async () => {
      const fixture = await setup([]);
      const empty = fixture.debugElement.query(By.css('[data-testid="empty-state"]'));
      expect(empty).toBeTruthy();
      expect(empty.nativeElement.textContent).toContain('No notes yet');
    });
  });
});
