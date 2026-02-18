import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { InsightsComponent } from './insights.component';
import { InsightsStore } from '../../state/insights.store';
import type { DayCount, DayEventEntry, DayFocusEntry, HabitStreakInfo, WeekSummary } from '../../state/insights.store';
import type { Habit } from '../../data/models/habit.model';

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

describe('InsightsComponent', () => {
  let fixture: ComponentFixture<InsightsComponent>;

  const mockTaskCompletion: DayCount[] = [
    { date: '2026-02-16', count: 3 },
    { date: '2026-02-15', count: 1 },
  ];

  const mockEventsByDay: DayEventEntry[] = [
    { date: '2026-02-16', count: 2, totalMinutes: 120 },
  ];

  const mockFocusByDay: DayFocusEntry[] = [
    { date: '2026-02-16', minutes: 75 },
  ];

  const mockHabitStreaks: HabitStreakInfo[] = [
    { habit: makeHabit({ title: 'Meditate' }), currentStreak: 5, longestStreak: 12, consistency: 80 },
  ];

  const mockWeekSummary: WeekSummary = {
    tasksCompleted: 10,
    habitsLogged: 6,
    focusMinutes: 200,
    eventsAttended: 4,
    productivityScore: 65,
  };

  const mockInsightsStore = {
    taskCompletionByDay: signal(mockTaskCompletion),
    totalTasksCompleted: signal(4),
    eventsByDay: signal(mockEventsByDay),
    focusByDay: signal(mockFocusByDay),
    totalFocusMinutes: signal(75),
    habitStreaks: signal(mockHabitStreaks),
    overallHabitConsistency: signal(80),
    productivityScore: signal(65),
    weekSummary: signal(mockWeekSummary),
    dateRangeDays: signal(28),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsightsComponent],
      providers: [
        { provide: InsightsStore, useValue: mockInsightsStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InsightsComponent);
    await fixture.whenStable();
  });

  describe('rendering', () => {
    it('should render all insight widgets and page title', () => {
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('app-score-card')).toBeTruthy();
      expect(el.querySelectorAll('app-trend-chart').length).toBeGreaterThan(0);
      expect(el.querySelector('app-habit-streaks-widget')).toBeTruthy();
      expect(el.querySelector('app-weekly-summary-card')).toBeTruthy();
      expect(el.textContent).toContain('Insights');
    });
  });
});
