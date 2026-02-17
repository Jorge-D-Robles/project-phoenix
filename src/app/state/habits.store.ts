import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

import { Habit, HabitLog } from '../data/models/habit.model';
import { HabitService } from '../data/habit.service';

interface HabitsState {
  readonly habits: Habit[];
  readonly logs: HabitLog[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly selectedHabitId: string | null;
}

const initialState: HabitsState = {
  habits: [],
  logs: [],
  loading: false,
  error: null,
  selectedHabitId: null,
};

/** Generate a UUID v4 */
const uuid = (): string => crypto.randomUUID();

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
      if (!id) return [];
      return logs().filter(l => l.habitId === id);
    }),
    /** Streak counts per habit (consecutive days backward from today) */
    streaks: computed((): Map<string, number> => {
      const allLogs = logs();
      const map = new Map<string, number>();
      for (const habit of habits().filter(h => !h.archived)) {
        const habitLogs = new Set(
          allLogs.filter(l => l.habitId === habit.id && l.value > 0).map(l => l.date),
        );
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const key = d.toISOString().split('T')[0];
          if (habitLogs.has(key)) {
            streak++;
          } else {
            break;
          }
        }
        map.set(habit.id, streak);
      }
      return map;
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
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        patchState(store, { error: 'Failed to save habits data' });
        console.error('HabitsStore.saveData failed:', message);
      }
    }

    return {
      async loadData(): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const data = await firstValueFrom(habitService.loadData());
          patchState(store, {
            habits: [...data.habits],
            logs: [...data.logs],
            loading: false,
          });
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : 'Unknown error';
          patchState(store, { error: 'Failed to load habits data', loading: false });
          console.error('HabitsStore.loadData failed:', message);
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

      async updateHabit(id: string, updates: Partial<Omit<Habit, 'id' | 'created'>>): Promise<void> {
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
