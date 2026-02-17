import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';

import { TasksStore } from './tasks.store';
import { CalendarStore } from './calendar.store';
import { HabitsStore } from './habits.store';
import { NotesStore } from './notes.store';
import { AuthService } from '../core/auth.service';
import type { Task } from '../data/models/task.model';
import type { CalendarEvent } from '../data/models/calendar-event.model';
import type { Habit } from '../data/models/habit.model';
import type { Note } from '../data/models/note.model';

export interface HabitStatusEntry {
  readonly habit: Habit;
  readonly loggedToday: boolean;
  readonly todayValue: number;
}

export interface CompletionSummary {
  readonly done: number;
  readonly total: number;
  readonly percentage: number;
}

interface DashboardState {
  readonly initialized: boolean;
}

const initialState: DashboardState = {
  initialized: false,
};

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function getGreetingPrefix(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((
    _store,
    tasksStore = inject(TasksStore),
    calendarStore = inject(CalendarStore),
    habitsStore = inject(HabitsStore),
    notesStore = inject(NotesStore),
    authService = inject(AuthService),
  ) => ({
    todayTasks: computed((): Task[] => {
      const today = getTodayString();
      return tasksStore.tasks().filter(task => {
        if (!task.dueDateTime) return false;
        if (task.status !== 'needsAction') return false;
        const dueDate = task.dueDateTime.substring(0, 10);
        return dueDate <= today;
      });
    }),

    todayEvents: computed((): CalendarEvent[] => {
      const today = getTodayString();
      return calendarStore.events()
        .filter(event => event.start.substring(0, 10) === today)
        .sort((a, b) => a.start.localeCompare(b.start));
    }),

    habitStatus: computed((): HabitStatusEntry[] => {
      const today = getTodayString();
      const logs = habitsStore.logs();
      return habitsStore.activeHabits().map(habit => {
        const todayLog = logs.find(l => l.habitId === habit.id && l.date === today);
        return {
          habit,
          loggedToday: !!todayLog,
          todayValue: todayLog?.value ?? 0,
        };
      });
    }),

    recentNotes: computed((): Note[] => {
      return [...notesStore.notes()]
        .sort((a, b) => b.lastModified.localeCompare(a.lastModified))
        .slice(0, 4);
    }),

    greeting: computed((): string => {
      const prefix = getGreetingPrefix();
      const name = authService.user()?.name ?? '';
      return name ? `${prefix}, ${name}` : prefix;
    }),

    completionSummary: computed((): CompletionSummary => {
      const today = getTodayString();
      const allTasks = tasksStore.tasks();

      const todayAndOverdue = allTasks.filter(task => {
        if (!task.dueDateTime) return false;
        const dueDate = task.dueDateTime.substring(0, 10);
        return dueDate <= today;
      });

      const total = todayAndOverdue.length;
      const done = todayAndOverdue.filter(t => t.status === 'completed').length;
      const percentage = total === 0 ? 0 : (done / total) * 100;

      return { done, total, percentage };
    }),
  })),
  withMethods((
    store,
    tasksStore = inject(TasksStore),
    calendarStore = inject(CalendarStore),
    habitsStore = inject(HabitsStore),
    notesStore = inject(NotesStore),
  ) => ({
    async loadAll(): Promise<void> {
      await Promise.all([
        tasksStore.loadTaskLists(),
        calendarStore.initialSync(),
        habitsStore.loadData(),
        notesStore.loadNotes(),
      ]);

      const lists = tasksStore.taskLists();
      if (lists.length > 0) {
        await tasksStore.loadTasks(lists[0].id);
      }

      patchState(store, { initialized: true });
    },
  })),
);
