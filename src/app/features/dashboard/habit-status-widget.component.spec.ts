import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HabitStatusWidgetComponent } from './habit-status-widget.component';
import type { HabitStatusEntry } from '../../state/dashboard.store';

const MOCK_HABITS: HabitStatusEntry[] = [
  {
    habit: {
      id: 'h1', title: 'Exercise', frequency: 'DAILY', targetValue: 1,
      color: '#FF0000', archived: false, created: '2026-01-01T00:00:00Z',
      lastModified: '2026-02-16T00:00:00Z',
    },
    loggedToday: true,
    todayValue: 1,
  },
  {
    habit: {
      id: 'h2', title: 'Read', frequency: 'DAILY', targetValue: 30,
      color: '#00FF00', archived: false, created: '2026-01-01T00:00:00Z',
      lastModified: '2026-02-16T00:00:00Z',
    },
    loggedToday: false,
    todayValue: 0,
  },
];

describe('HabitStatusWidgetComponent', () => {
  async function setup(habits: HabitStatusEntry[] = MOCK_HABITS) {
    await TestBed.configureTestingModule({
      imports: [HabitStatusWidgetComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    const fixture = TestBed.createComponent(HabitStatusWidgetComponent);
    fixture.componentRef.setInput('habits', habits);
    await fixture.whenStable();
    return fixture;
  }

  afterEach(() => TestBed.resetTestingModule());

  describe('rendering', () => {
    it('should render an item for each habit', async () => {
      const fixture = await setup();
      const items = fixture.debugElement.queryAll(By.css('[data-testid="habit-item"]'));
      expect(items.length).toBe(2);
    });

    it('should display habit titles', async () => {
      const fixture = await setup();
      const titles = fixture.debugElement.queryAll(By.css('[data-testid="habit-title"]'));
      expect(titles[0].nativeElement.textContent).toContain('Exercise');
      expect(titles[1].nativeElement.textContent).toContain('Read');
    });

    it('should show check icon for logged habits', async () => {
      const fixture = await setup();
      const doneIcons = fixture.debugElement.queryAll(By.css('[data-testid="habit-done"]'));
      expect(doneIcons.length).toBe(1);
    });

    it('should show log button for unlogged habits', async () => {
      const fixture = await setup();
      const logBtns = fixture.debugElement.queryAll(By.css('[data-testid="habit-log-btn"]'));
      expect(logBtns.length).toBe(1);
    });

    it('should display habit color indicator', async () => {
      const fixture = await setup();
      const colors = fixture.debugElement.queryAll(By.css('[data-testid="habit-color"]'));
      expect(colors.length).toBe(2);
      expect(colors[0].nativeElement.style.backgroundColor).toBeTruthy();
    });

    it('should show empty state when no habits', async () => {
      const fixture = await setup([]);
      const empty = fixture.debugElement.query(By.css('[data-testid="empty-state"]'));
      expect(empty).toBeTruthy();
      expect(empty.nativeElement.textContent).toContain('No active habits');
    });
  });

  describe('interactions', () => {
    it('should emit logHabit event with habit id when log button clicked', async () => {
      const fixture = await setup();
      const component = fixture.componentInstance;
      let emittedId: string | undefined;
      component.logHabit.subscribe((id: string) => emittedId = id);

      const logBtn = fixture.debugElement.query(By.css('[data-testid="habit-log-btn"]'));
      logBtn.nativeElement.click();

      expect(emittedId).toBe('h2');
    });
  });
});
