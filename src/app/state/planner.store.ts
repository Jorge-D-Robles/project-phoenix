import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

import type { TimeBlock } from '../data/models/time-block.model';
import { CalendarService } from '../data/calendar.service';
import { CalendarStore } from './calendar.store';
import { TasksStore } from './tasks.store';
import { todayDateKey } from '../shared/date.utils';

interface PlannerState {
  readonly timeBlocks: TimeBlock[];
  readonly selectedDate: string;
  readonly loading: boolean;
  readonly error: string | null;
}

const initialState: PlannerState = {
  timeBlocks: [],
  selectedDate: todayDateKey(),
  loading: false,
  error: null,
};

export const PlannerStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store, tasksStore = inject(TasksStore), calendarStore = inject(CalendarStore)) => ({
    /** Tasks that haven't been scheduled yet (no time block for them) */
    unscheduledTasks: computed(() => {
      const blockedTaskIds = new Set(
        store.timeBlocks().map(tb => tb.taskId).filter(Boolean),
      );
      return tasksStore.tasks().filter(
        t => t.status === 'needsAction' && !blockedTaskIds.has(t.id),
      );
    }),

    /** Events for the selected date from the calendar store */
    dayEvents: computed(() => {
      const date = store.selectedDate();
      return calendarStore.events().filter(event => {
        if (event.allDay) return false;
        return event.start.substring(0, 10) === date;
      });
    }),
  })),
  withMethods((store, calendarService = inject(CalendarService), calendarStore = inject(CalendarStore)) => ({
    setDate(date: string): void {
      patchState(store, { selectedDate: date });
    },

    async createTimeBlock(
      title: string,
      start: string,
      end: string,
      taskId: string | null = null,
    ): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const body = {
          summary: taskId ? `Task: ${title}` : title,
          start: { dateTime: start },
          end: { dateTime: end },
          description: taskId ? `Phoenix time block for task ${taskId}` : 'Phoenix time block',
          colorId: '7', // Peacock blue for time blocks
        };
        const result = await firstValueFrom(calendarService.createEvent(body));

        const timeBlock: TimeBlock = {
          id: result.id,
          taskId,
          title,
          start,
          end,
          colorId: '7',
        };

        patchState(store, {
          timeBlocks: [...store.timeBlocks(), timeBlock],
          loading: false,
        });

        // Refresh calendar to show the new event
        await calendarStore.initialSync();
      } catch {
        patchState(store, { error: 'Failed to create time block', loading: false });
      }
    },

    async removeTimeBlock(id: string): Promise<void> {
      const previous = store.timeBlocks();
      patchState(store, {
        timeBlocks: previous.filter(tb => tb.id !== id),
        error: null,
      });
      try {
        await firstValueFrom(calendarService.deleteEvent(id));
        await calendarStore.initialSync();
      } catch {
        patchState(store, { timeBlocks: previous, error: 'Failed to delete time block' });
      }
    },

    async updateTimeBlock(id: string, changes: Partial<Pick<TimeBlock, 'title' | 'start' | 'end'>>): Promise<void> {
      patchState(store, { error: null });
      try {
        const body: Record<string, unknown> = {};
        if (changes.title) body['summary'] = changes.title;
        if (changes.start) body['start'] = { dateTime: changes.start };
        if (changes.end) body['end'] = { dateTime: changes.end };

        await firstValueFrom(calendarService.updateEvent(id, body as any));

        patchState(store, {
          timeBlocks: store.timeBlocks().map(tb =>
            tb.id === id ? { ...tb, ...changes } : tb,
          ),
        });

        await calendarStore.initialSync();
      } catch {
        patchState(store, { error: 'Failed to update time block' });
      }
    },
  })),
);
