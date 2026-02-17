import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

import { HttpErrorResponse } from '@angular/common/http';
import { CalendarEvent } from '../data/models/calendar-event.model';
import { CalendarService } from '../data/calendar.service';

interface CalendarState {
  readonly events: CalendarEvent[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly syncToken: string | null;
  readonly selectedDate: string;
}

const initialState: CalendarState = {
  events: [],
  loading: false,
  error: null,
  syncToken: null,
  selectedDate: new Date().toISOString().split('T')[0],
};

export const CalendarStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ events, selectedDate }) => ({
    eventsForSelectedDate: computed(() => {
      const date = selectedDate();
      return events().filter(event => {
        if (event.allDay) {
          // All-day events: start is a date string (YYYY-MM-DD)
          return event.start <= date && event.end > date;
        }
        // Timed events: compare the date portion of the ISO dateTime
        return event.start.substring(0, 10) === date;
      });
    }),
  })),
  withMethods((store, calendarService = inject(CalendarService)) => ({
    async initialSync(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const result = await firstValueFrom(calendarService.getEvents(new Date()));
        patchState(store, {
          events: result.events,
          syncToken: result.syncToken,
          loading: false,
        });
      } catch {
        patchState(store, { error: 'Failed to load calendar events', loading: false });
      }
    },

    async incrementalSync(): Promise<void> {
      const token = store.syncToken();
      if (!token) return;

      try {
        const result = await firstValueFrom(calendarService.syncEvents(token));

        // Merge: update existing events, add new ones, remove cancelled
        const cancelled = new Set(
          result.events.filter(e => e.status === 'cancelled').map(e => e.id),
        );
        const updatedMap = new Map(
          result.events.filter(e => e.status !== 'cancelled').map(e => [e.id, e]),
        );

        const merged = store.events()
          .filter(e => !cancelled.has(e.id))
          .map(e => updatedMap.get(e.id) ?? e);

        // Add genuinely new events (not updates to existing)
        const existingIds = new Set(merged.map(e => e.id));
        for (const event of updatedMap.values()) {
          if (!existingIds.has(event.id)) {
            merged.push(event);
          }
        }

        patchState(store, {
          events: merged,
          syncToken: result.syncToken,
          error: null,
        });
      } catch (error: unknown) {
        if (error instanceof HttpErrorResponse && error.status === 410) {
          // 410 Gone — sync token invalidated, do full re-sync
          patchState(store, { syncToken: null });
          try {
            const result = await firstValueFrom(calendarService.getEvents(new Date()));
            patchState(store, {
              events: result.events,
              syncToken: result.syncToken,
              error: null,
            });
          } catch {
            patchState(store, { error: 'Failed to load calendar events' });
          }
        } else {
          patchState(store, { error: 'Failed to sync calendar events' });
        }
      }
    },

    selectDate(date: string): void {
      patchState(store, { selectedDate: date });
    },
  })),
);
