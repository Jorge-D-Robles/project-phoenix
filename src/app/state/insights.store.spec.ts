import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { InsightsStore } from './insights.store';
import { TasksStore } from './tasks.store';
import { CalendarStore } from './calendar.store';
import { HabitsStore } from './habits.store';
import type { Task } from '../data/models/task.model';
import type { CalendarEvent } from '../data/models/calendar-event.model';
import type { Habit, HabitLog } from '../data/models/habit.model';
import type { FocusSession } from '../data/models/focus-session.model';

/** Build an ISO date string for N days ago at noon UTC */
function daysAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  d.setUTCHours(12, 0, 0, 0);
  return d.toISOString();
}

/** Build a YYYY-MM-DD string for N days ago */
function dateStr(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().split('T')[0];
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: crypto.randomUUID(),
    localId: crypto.randomUUID(),
    title: 'Test Task',
    status: 'needsAction',
    dueDateTime: null,
    notes: null,
    meta: null,
    parent: null,
    position: '0',
    updatedDateTime: new Date().toISOString(),
    ...overrides,
  };
}

function makeEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: crypto.randomUUID(),
    summary: 'Test Event',
    description: null,
    start: new Date().toISOString(),
    end: new Date(Date.now() + 3600000).toISOString(),
    allDay: false,
    colorId: null,
    color: { name: 'Default', hex: '#4285F4' },
    location: null,
    htmlLink: null,
    status: 'confirmed',
    updatedDateTime: new Date().toISOString(),
    meetLink: null,
    ...overrides,
  };
}

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

function makeSession(overrides: Partial<FocusSession> = {}): FocusSession {
  return {
    id: crypto.randomUUID(),
    taskId: null,
    taskTitle: null,
    startTime: new Date().toISOString(),
    plannedDuration: 25,
    actualDuration: 25,
    completed: true,
    type: 'WORK',
    ...overrides,
  };
}

describe('InsightsStore', () => {
  let store: InstanceType<typeof InsightsStore>;

  // Writable mock signals
  const mockTasks = signal<Task[]>([]);
  const mockEvents = signal<CalendarEvent[]>([]);
  const mockHabits = signal<Habit[]>([]);
  const mockLogs = signal<HabitLog[]>([]);
  const mockSessions = signal<FocusSession[]>([]);

  const mockTasksStore = {
    tasks: mockTasks.asReadonly(),
  };

  const mockCalendarStore = {
    events: mockEvents.asReadonly(),
  };

  const mockHabitsStore = {
    habits: mockHabits.asReadonly(),
    logs: mockLogs.asReadonly(),
  };

  const mockFocusStore = {
    sessions: mockSessions.asReadonly(),
  };

  beforeEach(() => {
    // Reset signals before each test
    mockTasks.set([]);
    mockEvents.set([]);
    mockHabits.set([]);
    mockLogs.set([]);
    mockSessions.set([]);

    TestBed.configureTestingModule({
      providers: [
        InsightsStore,
        { provide: TasksStore, useValue: mockTasksStore },
        { provide: CalendarStore, useValue: mockCalendarStore },
        { provide: HabitsStore, useValue: mockHabitsStore },
      ],
    });

    store = TestBed.inject(InsightsStore);
  });

  describe('initial state', () => {
    it('should have default dateRangeDays of 28', () => {
      expect(store.dateRangeDays()).toBe(28);
    });
  });

  describe('taskCompletionByDay', () => {
    it('should return an array of 28 entries', () => {
      expect(store.taskCompletionByDay().length).toBe(28);
    });

    it('should count completed tasks per day', () => {
      const twoDaysAgoDate = dateStr(2);
      mockTasks.set([
        makeTask({ status: 'completed', updatedDateTime: daysAgo(2) }),
        makeTask({ status: 'completed', updatedDateTime: daysAgo(2) }),
        makeTask({ status: 'needsAction', updatedDateTime: daysAgo(2) }),
      ]);

      const result = store.taskCompletionByDay();
      const entry = result.find(e => e.date === twoDaysAgoDate);
      expect(entry).toBeTruthy();
      expect(entry!.count).toBe(2);
    });

    it('should return 0 for days with no completed tasks', () => {
      mockTasks.set([]);
      const result = store.taskCompletionByDay();
      result.forEach(entry => {
        expect(entry.count).toBe(0);
      });
    });

    it('should ignore tasks outside the 28-day range', () => {
      mockTasks.set([
        makeTask({ status: 'completed', updatedDateTime: daysAgo(30) }),
      ]);
      const result = store.taskCompletionByDay();
      const total = result.reduce((sum, e) => sum + e.count, 0);
      expect(total).toBe(0);
    });
  });

  describe('totalTasksCompleted', () => {
    it('should count all completed tasks in date range', () => {
      mockTasks.set([
        makeTask({ status: 'completed', updatedDateTime: daysAgo(1) }),
        makeTask({ status: 'completed', updatedDateTime: daysAgo(5) }),
        makeTask({ status: 'needsAction', updatedDateTime: daysAgo(1) }),
        makeTask({ status: 'completed', updatedDateTime: daysAgo(30) }), // out of range
      ]);
      expect(store.totalTasksCompleted()).toBe(2);
    });

    it('should return 0 when no tasks are completed', () => {
      mockTasks.set([
        makeTask({ status: 'needsAction', updatedDateTime: daysAgo(1) }),
      ]);
      expect(store.totalTasksCompleted()).toBe(0);
    });
  });

  describe('habitStreaks', () => {
    it('should compute current streak from today backward', () => {
      const habit = makeHabit({ id: 'h1' });
      mockHabits.set([habit]);
      mockLogs.set([
        { habitId: 'h1', date: dateStr(0), value: 1 },
        { habitId: 'h1', date: dateStr(1), value: 1 },
        { habitId: 'h1', date: dateStr(2), value: 1 },
        // gap at day 3
        { habitId: 'h1', date: dateStr(4), value: 1 },
      ]);

      const result = store.habitStreaks();
      expect(result.length).toBe(1);
      expect(result[0].currentStreak).toBe(3);
    });

    it('should compute longest streak in date range', () => {
      const habit = makeHabit({ id: 'h1' });
      mockHabits.set([habit]);
      mockLogs.set([
        { habitId: 'h1', date: dateStr(0), value: 1 },
        // gap at day 1
        { habitId: 'h1', date: dateStr(2), value: 1 },
        { habitId: 'h1', date: dateStr(3), value: 1 },
        { habitId: 'h1', date: dateStr(4), value: 1 },
        { habitId: 'h1', date: dateStr(5), value: 1 },
      ]);

      const result = store.habitStreaks();
      expect(result[0].longestStreak).toBe(4);
    });

    it('should compute consistency percentage', () => {
      const habit = makeHabit({ id: 'h1' });
      mockHabits.set([habit]);
      // Log 14 out of 28 days
      const logs: HabitLog[] = [];
      for (let i = 0; i < 14; i++) {
        logs.push({ habitId: 'h1', date: dateStr(i * 2), value: 1 });
      }
      mockLogs.set(logs);

      const result = store.habitStreaks();
      expect(result[0].consistency).toBe(50);
    });

    it('should exclude archived habits', () => {
      mockHabits.set([
        makeHabit({ id: 'h1', archived: true }),
        makeHabit({ id: 'h2', archived: false }),
      ]);
      mockLogs.set([
        { habitId: 'h1', date: dateStr(0), value: 1 },
        { habitId: 'h2', date: dateStr(0), value: 1 },
      ]);

      const result = store.habitStreaks();
      expect(result.length).toBe(1);
      expect(result[0].habit.id).toBe('h2');
    });

    it('should return 0 streak when no logs exist', () => {
      mockHabits.set([makeHabit({ id: 'h1' })]);
      mockLogs.set([]);

      const result = store.habitStreaks();
      expect(result[0].currentStreak).toBe(0);
      expect(result[0].longestStreak).toBe(0);
      expect(result[0].consistency).toBe(0);
    });
  });

  describe('overallHabitConsistency', () => {
    it('should average consistency across active habits', () => {
      mockHabits.set([
        makeHabit({ id: 'h1' }),
        makeHabit({ id: 'h2' }),
      ]);
      // h1: 28 days logged = 100%
      // h2: 0 days logged = 0%
      const logs: HabitLog[] = [];
      for (let i = 0; i < 28; i++) {
        logs.push({ habitId: 'h1', date: dateStr(i), value: 1 });
      }
      mockLogs.set(logs);

      expect(store.overallHabitConsistency()).toBe(50);
    });

    it('should return 0 when no active habits exist', () => {
      mockHabits.set([]);
      expect(store.overallHabitConsistency()).toBe(0);
    });
  });

  describe('eventsByDay', () => {
    it('should count events per day', () => {
      const todayStr = dateStr(0);
      const todayStart = new Date();
      todayStart.setUTCHours(9, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setUTCHours(10, 0, 0, 0);

      mockEvents.set([
        makeEvent({ start: todayStart.toISOString(), end: todayEnd.toISOString() }),
        makeEvent({ start: todayStart.toISOString(), end: todayEnd.toISOString() }),
      ]);

      const result = store.eventsByDay();
      const entry = result.find(e => e.date === todayStr);
      expect(entry).toBeTruthy();
      expect(entry!.count).toBe(2);
    });

    it('should compute total minutes for timed events', () => {
      const start = new Date();
      start.setUTCHours(9, 0, 0, 0);
      const end = new Date();
      end.setUTCHours(10, 30, 0, 0); // 90 min

      mockEvents.set([
        makeEvent({ start: start.toISOString(), end: end.toISOString(), allDay: false }),
      ]);

      const result = store.eventsByDay();
      const todayStr = dateStr(0);
      const entry = result.find(e => e.date === todayStr);
      expect(entry).toBeTruthy();
      expect(entry!.totalMinutes).toBe(90);
    });

    it('should return 28 entries', () => {
      expect(store.eventsByDay().length).toBe(28);
    });
  });

  describe('focusByDay', () => {
    it('should return 28 entries', () => {
      expect(store.focusByDay().length).toBe(28);
    });

    it('should default to empty when FocusStore is not available', () => {
      const result = store.focusByDay();
      result.forEach(entry => {
        expect(entry.minutes).toBe(0);
      });
    });
  });

  describe('totalFocusMinutes', () => {
    it('should return 0 when FocusStore is not available', () => {
      expect(store.totalFocusMinutes()).toBe(0);
    });
  });

  describe('productivityScore', () => {
    it('should return 0 when all data is empty', () => {
      expect(store.productivityScore()).toBe(0);
    });

    it('should compute weighted score from tasks, habits, and focus', () => {
      // Set up some completed tasks
      for (let i = 0; i < 10; i++) {
        mockTasks.update(prev => [
          ...prev,
          makeTask({ status: 'completed', updatedDateTime: daysAgo(i % 7) }),
        ]);
      }

      // Set up habits with 100% consistency
      mockHabits.set([makeHabit({ id: 'h1' })]);
      const logs: HabitLog[] = [];
      for (let i = 0; i < 28; i++) {
        logs.push({ habitId: 'h1', date: dateStr(i), value: 1 });
      }
      mockLogs.set(logs);

      const score = store.productivityScore();
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should weight tasks at 40%, habits at 35%, focus at 25%', () => {
      // Only tasks completed: 10 tasks, avgCreatedPerWeek = totalTasks/4
      // totalTasks = 10, avgCreatedPerWeek = 2.5, taskRatio = min(1, 10/2.5) = 1
      // habitConsistency = 0, focusRatio = 0
      // score = (0.4 * 1 + 0.35 * 0 + 0.25 * 0) * 100 = 40
      for (let i = 0; i < 10; i++) {
        mockTasks.update(prev => [
          ...prev,
          makeTask({ status: 'completed', updatedDateTime: daysAgo(i % 7) }),
        ]);
      }

      const score = store.productivityScore();
      expect(score).toBeCloseTo(40, 0);
    });
  });

  describe('weekSummary', () => {
    it('should have tasksCompleted for current week', () => {
      // Add a task completed today (within current week)
      mockTasks.set([
        makeTask({ status: 'completed', updatedDateTime: daysAgo(0) }),
      ]);

      const summary = store.weekSummary();
      expect(summary.tasksCompleted).toBeGreaterThanOrEqual(1);
    });

    it('should have habitsLogged for current week', () => {
      mockHabits.set([makeHabit({ id: 'h1' })]);
      mockLogs.set([
        { habitId: 'h1', date: dateStr(0), value: 1 },
      ]);

      const summary = store.weekSummary();
      expect(summary.habitsLogged).toBeGreaterThanOrEqual(1);
    });

    it('should have focusMinutes default to 0 without FocusStore', () => {
      const summary = store.weekSummary();
      expect(summary.focusMinutes).toBe(0);
    });

    it('should include eventsAttended', () => {
      const todayStart = new Date();
      todayStart.setUTCHours(9, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setUTCHours(10, 0, 0, 0);

      mockEvents.set([
        makeEvent({ start: todayStart.toISOString(), end: todayEnd.toISOString() }),
      ]);

      const summary = store.weekSummary();
      expect(summary.eventsAttended).toBeGreaterThanOrEqual(1);
    });

    it('should include productivityScore', () => {
      const summary = store.weekSummary();
      expect(summary.productivityScore).toBeDefined();
      expect(typeof summary.productivityScore).toBe('number');
    });
  });
});
