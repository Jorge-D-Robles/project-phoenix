import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HabitCardComponent } from './habit-card.component';
import { Habit } from '../../data/models/habit.model';

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'h1',
    title: 'Exercise',
    frequency: 'DAILY',
    targetValue: 1,
    color: '#4CAF50',
    archived: false,
    created: '2026-02-01T00:00:00Z',
    lastModified: '2026-02-01T00:00:00Z',
    ...overrides,
  };
}

describe('HabitCardComponent', () => {
  async function setup(habit: Habit = makeHabit()) {
    await TestBed.configureTestingModule({
      imports: [HabitCardComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    const fixture = TestBed.createComponent(HabitCardComponent);
    fixture.componentRef.setInput('habit', habit);
    await fixture.whenStable();
    return fixture;
  }

  afterEach(() => TestBed.resetTestingModule());

  describe('rendering', () => {
    it('should display the habit title', async () => {
      const fixture = await setup();
      const title = fixture.debugElement.query(By.css('[data-testid="habit-title"]'));
      expect(title).toBeTruthy();
      expect(title.nativeElement.textContent).toContain('Exercise');
    });

    it('should display the frequency badge', async () => {
      const fixture = await setup();
      const badge = fixture.debugElement.query(By.css('[data-testid="habit-frequency"]'));
      expect(badge).toBeTruthy();
      expect(badge.nativeElement.textContent).toContain('DAILY');
    });

    it('should display the color indicator', async () => {
      const fixture = await setup();
      const indicator = fixture.debugElement.query(By.css('[data-testid="habit-color"]'));
      expect(indicator).toBeTruthy();
      expect(indicator.nativeElement.style.backgroundColor).toBeTruthy();
    });

    it('should display a Log Today button', async () => {
      const fixture = await setup();
      const btn = fixture.debugElement.query(By.css('[data-testid="log-btn"]'));
      expect(btn).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should emit log event when Log Today button is clicked', async () => {
      const fixture = await setup();
      let emittedId: string | undefined;

      fixture.componentInstance.log.subscribe((id: string) => {
        emittedId = id;
      });

      const btn = fixture.debugElement.query(By.css('[data-testid="log-btn"]'));
      btn.nativeElement.click();
      expect(emittedId).toBe('h1');
    });

    it('should emit select event when card is clicked', async () => {
      const fixture = await setup();
      let emittedId: string | undefined;

      fixture.componentInstance.select.subscribe((id: string) => {
        emittedId = id;
      });

      const card = fixture.debugElement.query(By.css('[data-testid="habit-card"]'));
      card.nativeElement.click();
      expect(emittedId).toBe('h1');
    });
  });

  describe('variations', () => {
    it('should display WEEKLY frequency', async () => {
      const fixture = await setup(makeHabit({ frequency: 'WEEKLY' }));
      const badge = fixture.debugElement.query(By.css('[data-testid="habit-frequency"]'));
      expect(badge.nativeElement.textContent).toContain('WEEKLY');
    });

    it('should display MONTHLY frequency', async () => {
      const fixture = await setup(makeHabit({ frequency: 'MONTHLY' }));
      const badge = fixture.debugElement.query(By.css('[data-testid="habit-frequency"]'));
      expect(badge.nativeElement.textContent).toContain('MONTHLY');
    });
  });
});
