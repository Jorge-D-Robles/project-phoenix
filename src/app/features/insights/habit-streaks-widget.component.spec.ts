import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HabitStreaksWidgetComponent } from './habit-streaks-widget.component';
import type { Habit } from '../../data/models/habit.model';
import type { HabitStreakInfo } from '../../state/insights.store';

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: crypto.randomUUID(),
    title: 'Test Habit',
    frequency: 'DAILY',
    targetValue: 1,
    color: '#4CAF50',
    archived: false,
    created: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    ...overrides,
  };
}

describe('HabitStreaksWidgetComponent', () => {
  let fixture: ComponentFixture<HabitStreaksWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitStreaksWidgetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HabitStreaksWidgetComponent);
  });

  describe('rendering', () => {
    it('should render a row for each habit streak', async () => {
      const streaks: HabitStreakInfo[] = [
        { habit: makeHabit({ title: 'Meditate' }), currentStreak: 5, longestStreak: 12, consistency: 80 },
        { habit: makeHabit({ title: 'Exercise' }), currentStreak: 3, longestStreak: 7, consistency: 60 },
      ];
      fixture.componentRef.setInput('streaks', streaks);
      await fixture.whenStable();

      const rows = fixture.nativeElement.querySelectorAll('[data-testid="streak-row"]');
      expect(rows.length).toBe(2);
    });

    it('should display habit title', async () => {
      const streaks: HabitStreakInfo[] = [
        { habit: makeHabit({ title: 'Read' }), currentStreak: 10, longestStreak: 15, consistency: 90 },
      ];
      fixture.componentRef.setInput('streaks', streaks);
      await fixture.whenStable();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Read');
    });

    it('should display current streak count', async () => {
      const streaks: HabitStreakInfo[] = [
        { habit: makeHabit(), currentStreak: 7, longestStreak: 10, consistency: 50 },
      ];
      fixture.componentRef.setInput('streaks', streaks);
      await fixture.whenStable();

      const streakEl = fixture.nativeElement.querySelector('[data-testid="current-streak"]') as HTMLElement;
      expect(streakEl.textContent).toContain('7');
    });

    it('should display consistency percentage', async () => {
      const streaks: HabitStreakInfo[] = [
        { habit: makeHabit(), currentStreak: 3, longestStreak: 5, consistency: 75 },
      ];
      fixture.componentRef.setInput('streaks', streaks);
      await fixture.whenStable();

      const consistencyEl = fixture.nativeElement.querySelector('[data-testid="consistency"]') as HTMLElement;
      expect(consistencyEl.textContent).toContain('75');
    });

    it('should render empty state when no streaks', async () => {
      fixture.componentRef.setInput('streaks', []);
      await fixture.whenStable();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('No active habits');
    });
  });
});
