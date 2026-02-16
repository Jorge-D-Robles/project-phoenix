import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

import { Habit, HabitLog } from '../data/models/habit.model';
import { HabitService } from '../data/habit.service';

interface HabitsState {
  habits: Habit[];
  logs: HabitLog[];
  loading: boolean;
  error: string | null;
  selectedHabitId: string | null;
}

const initialState: HabitsState = {
  habits: [],
  logs: [],
  loading: false,
  error: null,
  selectedHabitId: null,
};

/** Generate a UUID v4 */
function uuid(): string {
  return crypto.randomUUID();
}

export const HabitsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ habits, logs, selectedHabitId }) => ({
    activeHabits: computed(() => habits().filter(h => !h.archived)),
    selectedHabit: computed(() => {
      const id = selectedHabitId();
      if (!id) return null;
      return habits().find(h => h.id === id) ?? null;
    }),
    logsForSelectedHabit: computed(() => {
      const id = selectedHabitId();
      if (!id) return [] as HabitLog[];
      return logs().filter(l => l.habitId === id);
    }),
  })),
  withMethods((store, habitService = inject(HabitService)) => {
    async function saveData(): Promise<void> {
      try {
        await firstValueFrom(habitService.saveData({
          habits: store.habits(),
          logs: store.logs(),
        }));
        patchState(store, { error: null });
      } catch {
        patchState(store, { error: 'Failed to save habits data' });
      }
    }

    return {
      async loadData(): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const data = await firstValueFrom(habitService.loadData());
          patchState(store, {
            habits: data.habits,
            logs: data.logs,
            loading: false,
          });
        } catch {
          patchState(store, { error: 'Failed to load habits data', loading: false });
        }
      },

      async addHabit(habit: Omit<Habit, 'id' | 'created' | 'lastModified'>): Promise<void> {
        const now = new Date().toISOString();
        const newHabit: Habit = {
          ...habit,
          id: uuid(),
          created: now,
          lastModified: now,
        };
        patchState(store, { habits: [...store.habits(), newHabit] });
        await saveData();
      },

      async updateHabit(id: string, updates: Partial<Habit>): Promise<void> {
        const now = new Date().toISOString();
        patchState(store, {
          habits: store.habits().map(h =>
            h.id === id ? { ...h, ...updates, lastModified: now } : h,
          ),
        });
        await saveData();
      },

      async archiveHabit(id: string): Promise<void> {
        const now = new Date().toISOString();
        patchState(store, {
          habits: store.habits().map(h =>
            h.id === id ? { ...h, archived: true, lastModified: now } : h,
          ),
        });
        await saveData();
      },

      async logHabit(habitId: string, date: string, value: number): Promise<void> {
        const existing = store.logs().find(l => l.habitId === habitId && l.date === date);
        let newLogs: HabitLog[];
        if (existing) {
          newLogs = store.logs().map(l =>
            l.habitId === habitId && l.date === date ? { ...l, value } : l,
          );
        } else {
          newLogs = [...store.logs(), { habitId, date, value }];
        }
        patchState(store, { logs: newLogs });
        await saveData();
      },

      selectHabit(id: string | null): void {
        patchState(store, { selectedHabitId: id });
      },

      async deleteLog(habitId: string, date: string): Promise<void> {
        patchState(store, {
          logs: store.logs().filter(l => !(l.habitId === habitId && l.date === date)),
        });
        await saveData();
      },
    };
  }),
);
