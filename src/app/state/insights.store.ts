import { computed, inject, InjectionToken, Signal } from '@angular/core';
import { signalStore, withState, withComputed } from '@ngrx/signals';

import { TasksStore } from './tasks.store';
import { CalendarStore } from './calendar.store';
import { HabitsStore } from './habits.store';
import type { Habit } from '../data/models/habit.model';
import type { FocusSession } from '../data/models/focus-session.model';

/** Per-day count entry for timeline data */
export interface DayCount {
  date: string;   // YYYY-MM-DD
  count: number;
}

/** Per-day event entry with count and duration */
export interface DayEventEntry {
  date: string;
  count: number;
  totalMinutes: number;
}

/** Per-day focus entry with total minutes */
export interface DayFocusEntry {
  date: string;
  minutes: number;
}

/** Streak data for a single habit */
export interface HabitStreakInfo {
  habit: Habit;
  currentStreak: number;
  longestStreak: number;
  consistency: number; // 0-100
}

/** Weekly summary stats */
export interface WeekSummary {
  tasksCompleted: number;
  habitsLogged: number;
  focusMinutes: number;
  eventsAttended: number;
  productivityScore: number;
}

interface InsightsState {
  dateRangeDays: number;
}

const initialState: InsightsState = {
  dateRangeDays: 28,
};

/**
 * Optional injection token for focus sessions signal.
 * FocusStore will provide this when it exists; otherwise defaults to empty array.
 */
export const FOCUS_SESSIONS = new InjectionToken<Signal<FocusSession[]>>('FOCUS_SESSIONS');

/** Generate an array of YYYY-MM-DD strings for the last N days (inclusive of today) */
function getDateRange(days: number): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

/** Get the Monday-to-Sunday range for the current week */
function getCurrentWeekRange(): { start: string; end: string } {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0=Sun, 1=Mon, ...
  const monday = new Date(now);
  // If Sunday (0), go back 6 days; otherwise go back (dayOfWeek - 1) days
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  monday.setUTCDate(monday.getUTCDate() - daysToMonday);

  const sunday = new Date(monday);
  sunday.setUTCDate(sunday.getUTCDate() + 6);

  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  };
}

/** Extract YYYY-MM-DD from an ISO datetime string */
function toDateKey(isoString: string): string {
  return isoString.substring(0, 10);
}

export const InsightsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state, tasksStore = inject(TasksStore), calendarStore = inject(CalendarStore), habitsStore = inject(HabitsStore)) => {
    // Optionally inject focus sessions — gracefully degrade to empty array
    const focusSessions: Signal<FocusSession[]> = inject(FOCUS_SESSIONS, { optional: true }) ?? (() => []) as unknown as Signal<FocusSession[]>;

    const dateRange = computed(() => getDateRange(state.dateRangeDays()));

    const taskCompletionByDay = computed<DayCount[]>(() => {
      const dates = dateRange();
      const tasks = tasksStore.tasks();
      const dateSet = new Set(dates);

      const countMap = new Map<string, number>();
      for (const date of dates) {
        countMap.set(date, 0);
      }

      for (const task of tasks) {
        if (task.status === 'completed') {
          const key = toDateKey(task.updatedDateTime);
          if (dateSet.has(key)) {
            countMap.set(key, (countMap.get(key) ?? 0) + 1);
          }
        }
      }

      return dates.map(date => ({ date, count: countMap.get(date) ?? 0 }));
    });

    const totalTasksCompleted = computed<number>(() => {
      return taskCompletionByDay().reduce((sum, entry) => sum + entry.count, 0);
    });

    const habitStreaks = computed<HabitStreakInfo[]>(() => {
      const dates = dateRange();
      const activeHabits = habitsStore.habits().filter(h => !h.archived);
      const logs = habitsStore.logs();
      const totalDays = dates.length;

      return activeHabits.map(habit => {
        const habitLogs = new Set(
          logs.filter(l => l.habitId === habit.id && l.value > 0).map(l => l.date),
        );

        // Current streak: consecutive days backward from today
        let currentStreak = 0;
        for (let i = 0; i < totalDays; i++) {
          const d = new Date();
          d.setUTCDate(d.getUTCDate() - i);
          const key = d.toISOString().split('T')[0];
          if (habitLogs.has(key)) {
            currentStreak++;
          } else {
            break;
          }
        }

        // Longest streak: scan the date range for the longest consecutive run
        let longestStreak = 0;
        let currentRun = 0;
        for (const date of dates) {
          if (habitLogs.has(date)) {
            currentRun++;
            if (currentRun > longestStreak) {
              longestStreak = currentRun;
            }
          } else {
            currentRun = 0;
          }
        }

        // Consistency: percentage of days with logs
        const daysWithLogs = dates.filter(d => habitLogs.has(d)).length;
        const consistency = totalDays > 0
          ? Math.round((daysWithLogs / totalDays) * 100)
          : 0;

        return { habit, currentStreak, longestStreak, consistency };
      });
    });

    const overallHabitConsistency = computed<number>(() => {
      const streaks = habitStreaks();
      if (streaks.length === 0) return 0;
      const total = streaks.reduce((sum, s) => sum + s.consistency, 0);
      return Math.round(total / streaks.length);
    });

    const eventsByDay = computed<DayEventEntry[]>(() => {
      const dates = dateRange();
      const events = calendarStore.events();

      const countMap = new Map<string, number>();
      const minutesMap = new Map<string, number>();
      for (const date of dates) {
        countMap.set(date, 0);
        minutesMap.set(date, 0);
      }

      const dateSet = new Set(dates);

      for (const event of events) {
        const key = toDateKey(event.start);
        if (dateSet.has(key)) {
          countMap.set(key, (countMap.get(key) ?? 0) + 1);

          if (!event.allDay) {
            const startMs = new Date(event.start).getTime();
            const endMs = new Date(event.end).getTime();
            const minutes = Math.round((endMs - startMs) / 60000);
            minutesMap.set(key, (minutesMap.get(key) ?? 0) + minutes);
          }
        }
      }

      return dates.map(date => ({
        date,
        count: countMap.get(date) ?? 0,
        totalMinutes: minutesMap.get(date) ?? 0,
      }));
    });

    const focusByDay = computed<DayFocusEntry[]>(() => {
      const dates = dateRange();
      const sessions = focusSessions();

      const minutesMap = new Map<string, number>();
      for (const date of dates) {
        minutesMap.set(date, 0);
      }

      const dateSet = new Set(dates);

      for (const session of sessions) {
        if (session.type === 'WORK' && session.completed) {
          const key = toDateKey(session.startTime);
          if (dateSet.has(key)) {
            minutesMap.set(key, (minutesMap.get(key) ?? 0) + session.actualDuration);
          }
        }
      }

      return dates.map(date => ({ date, minutes: minutesMap.get(date) ?? 0 }));
    });

    const totalFocusMinutes = computed<number>(() => {
      return focusByDay().reduce((sum, entry) => sum + entry.minutes, 0);
    });

    const productivityScore = computed<number>(() => {
      // Task ratio: min(1, completedTasks / max(1, avgCreatedPerWeek))
      const allTasks = tasksStore.tasks();
      const completed = totalTasksCompleted();
      const avgCreatedPerWeek = Math.max(1, allTasks.length / 4);
      const taskRatio = Math.min(1, completed / Math.max(1, avgCreatedPerWeek));

      // Habit consistency
      const habitConsistency = overallHabitConsistency() / 100;

      // Focus ratio: min(1, totalFocusMinutes / (5 * workDuration * 5))
      const workDuration = 25; // default if no FocusStore
      const focusTarget = 5 * workDuration * 5; // 5 sessions/day * 5 days
      const focusRatio = Math.min(1, totalFocusMinutes() / focusTarget);

      const score = (0.4 * taskRatio + 0.35 * habitConsistency + 0.25 * focusRatio) * 100;
      return Math.round(score);
    });

    const weekSummary = computed<WeekSummary>(() => {
      const { start, end } = getCurrentWeekRange();
      const tasks = tasksStore.tasks();
      const logs = habitsStore.logs();
      const events = calendarStore.events();
      const sessions = focusSessions();

      const tasksCompleted = tasks.filter(t => {
        if (t.status !== 'completed') return false;
        const key = toDateKey(t.updatedDateTime);
        return key >= start && key <= end;
      }).length;

      const habitsLogged = logs.filter(l => l.date >= start && l.date <= end).length;

      const focusMinutes = sessions
        .filter(s => {
          if (s.type !== 'WORK' || !s.completed) return false;
          const key = toDateKey(s.startTime);
          return key >= start && key <= end;
        })
        .reduce((sum, s) => sum + s.actualDuration, 0);

      const eventsAttended = events.filter(e => {
        const key = toDateKey(e.start);
        return key >= start && key <= end;
      }).length;

      return {
        tasksCompleted,
        habitsLogged,
        focusMinutes,
        eventsAttended,
        productivityScore: productivityScore(),
      };
    });

    return {
      taskCompletionByDay,
      totalTasksCompleted,
      habitStreaks,
      overallHabitConsistency,
      eventsByDay,
      focusByDay,
      totalFocusMinutes,
      productivityScore,
      weekSummary,
    };
  }),
);
