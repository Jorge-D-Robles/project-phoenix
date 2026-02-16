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
    it('should render the score card', () => {
      const scoreCard = fixture.nativeElement.querySelector('app-score-card');
      expect(scoreCard).toBeTruthy();
    });

    it('should render trend charts', () => {
      const charts = fixture.nativeElement.querySelectorAll('app-trend-chart');
      expect(charts.length).toBeGreaterThan(0);
    });

    it('should render the habit streaks widget', () => {
      const streaksWidget = fixture.nativeElement.querySelector('app-habit-streaks-widget');
      expect(streaksWidget).toBeTruthy();
    });

    it('should render the weekly summary card', () => {
      const summaryCard = fixture.nativeElement.querySelector('app-weekly-summary-card');
      expect(summaryCard).toBeTruthy();
    });

    it('should display the page title', () => {
      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Insights');
    });
  });
});
