import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { CalendarStore } from './calendar.store';
import { CalendarService, CalendarSyncResult } from '../data/calendar.service';
import { CalendarEvent } from '../data/models/calendar-event.model';

function makeEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: 'evt1',
    summary: 'Team Standup',
    description: 'Daily sync',
    start: '2026-02-16T09:00:00Z',
    end: '2026-02-16T09:30:00Z',
    allDay: false,
    colorId: '7',
    color: { name: 'Peacock', hex: '#039BE5' },
    location: 'Room 42',
    htmlLink: 'https://calendar.google.com/event?eid=abc',
    status: 'confirmed',
    updatedDateTime: '2026-02-15T12:00:00Z',
    ...overrides,
  };
}

const MOCK_EVENTS: CalendarEvent[] = [
  makeEvent({ id: 'evt1', summary: 'Morning Standup', start: '2026-02-16T09:00:00Z', end: '2026-02-16T09:30:00Z' }),
  makeEvent({ id: 'evt2', summary: 'Lunch Break', start: '2026-02-16T12:00:00Z', end: '2026-02-16T13:00:00Z' }),
  makeEvent({ id: 'evt3', summary: 'Sprint Planning', start: '2026-02-17T10:00:00Z', end: '2026-02-17T11:00:00Z' }),
  makeEvent({ id: 'evt4', summary: 'All Day Event', start: '2026-02-16', end: '2026-02-17', allDay: true }),
];

const MOCK_SYNC_RESULT: CalendarSyncResult = {
  events: MOCK_EVENTS,
  syncToken: 'sync-token-abc',
};

describe('CalendarStore', () => {
  let store: InstanceType<typeof CalendarStore>;
  let mockCalendarService: jasmine.SpyObj<CalendarService>;

  beforeEach(() => {
    mockCalendarService = jasmine.createSpyObj('CalendarService', [
      'getEvents', 'syncEvents',
    ]);
    mockCalendarService.getEvents.and.returnValue(of(MOCK_SYNC_RESULT));

    TestBed.configureTestingModule({
      providers: [
        CalendarStore,
        { provide: CalendarService, useValue: mockCalendarService },
      ],
    });

    store = TestBed.inject(CalendarStore);
  });

  describe('initial state', () => {
    it('should have empty events array', () => {
      expect(store.events()).toEqual([]);
    });

    it('should not be loading', () => {
      expect(store.loading()).toBe(false);
    });

    it('should have null error', () => {
      expect(store.error()).toBeNull();
    });

    it('should have null syncToken', () => {
      expect(store.syncToken()).toBeNull();
    });

    it('should have today as selectedDate', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(store.selectedDate()).toBe(today);
    });
  });

  describe('computed: eventsForSelectedDate', () => {
    it('should return events matching the selected date', async () => {
      await store.initialSync();
      store.selectDate('2026-02-16');
      const events = store.eventsForSelectedDate();
      // evt1, evt2 have dateTime on 2026-02-16; evt4 is all-day spanning that date
      expect(events.length).toBe(3);
    });

    it('should return empty array for date with no events', async () => {
      await store.initialSync();
      store.selectDate('2026-03-01');
      expect(store.eventsForSelectedDate()).toEqual([]);
    });

    it('should include all-day events for their date', async () => {
      await store.initialSync();
      store.selectDate('2026-02-16');
      const allDayEvents = store.eventsForSelectedDate().filter(e => e.allDay);
      expect(allDayEvents.length).toBe(1);
      expect(allDayEvents[0].id).toBe('evt4');
    });
  });

  describe('method: initialSync', () => {
    it('should set loading while fetching', async () => {
      const promise = store.initialSync();
      expect(store.loading()).toBe(true);
      await promise;
      expect(store.loading()).toBe(false);
    });

    it('should store fetched events', async () => {
      await store.initialSync();
      expect(store.events().length).toBe(4);
    });

    it('should store the syncToken', async () => {
      await store.initialSync();
      expect(store.syncToken()).toBe('sync-token-abc');
    });

    it('should call getEvents on the service', async () => {
      await store.initialSync();
      expect(mockCalendarService.getEvents).toHaveBeenCalled();
    });

    it('should set error on failure', async () => {
      mockCalendarService.getEvents.and.returnValue(
        throwError(() => new Error('Network error')),
      );
      await store.initialSync();
      expect(store.error()).toBe('Failed to load calendar events');
      expect(store.loading()).toBe(false);
    });
  });

  describe('method: incrementalSync', () => {
    const updatedResult: CalendarSyncResult = {
      events: [
        makeEvent({ id: 'evt2', summary: 'Updated Lunch', start: '2026-02-16T12:30:00Z', end: '2026-02-16T13:30:00Z' }),
        makeEvent({ id: 'evt5', summary: 'New Meeting', start: '2026-02-16T15:00:00Z', end: '2026-02-16T16:00:00Z' }),
      ],
      syncToken: 'sync-token-def',
    };

    beforeEach(async () => {
      await store.initialSync();
      mockCalendarService.syncEvents.and.returnValue(of(updatedResult));
    });

    it('should merge updated events into existing state', async () => {
      await store.incrementalSync();
      // evt2 should be updated, evt5 should be added
      const evt2 = store.events().find(e => e.id === 'evt2');
      expect(evt2?.summary).toBe('Updated Lunch');
      expect(store.events().find(e => e.id === 'evt5')).toBeTruthy();
    });

    it('should update the syncToken', async () => {
      await store.incrementalSync();
      expect(store.syncToken()).toBe('sync-token-def');
    });

    it('should call syncEvents with the stored token', async () => {
      await store.incrementalSync();
      expect(mockCalendarService.syncEvents).toHaveBeenCalledWith('sync-token-abc');
    });

    it('should remove cancelled events from state', async () => {
      const cancelResult: CalendarSyncResult = {
        events: [
          makeEvent({ id: 'evt1', status: 'cancelled' }),
        ],
        syncToken: 'sync-token-ghi',
      };
      mockCalendarService.syncEvents.and.returnValue(of(cancelResult));

      await store.incrementalSync();
      expect(store.events().find(e => e.id === 'evt1')).toBeUndefined();
    });

    it('should trigger full re-sync on 410 Gone', async () => {
      const error = new HttpErrorResponse({ status: 410, statusText: 'Gone' });
      mockCalendarService.syncEvents.and.returnValue(throwError(() => error));
      // After 410, it should call getEvents for a full re-sync
      mockCalendarService.getEvents.and.returnValue(of(MOCK_SYNC_RESULT));

      await store.incrementalSync();

      // getEvents called again for full resync (initial + resync = 2 total calls)
      expect(mockCalendarService.getEvents).toHaveBeenCalledTimes(2);
      expect(store.syncToken()).toBe('sync-token-abc');
    });

    it('should set error on non-410 failure', async () => {
      mockCalendarService.syncEvents.and.returnValue(
        throwError(() => new Error('Network error')),
      );

      await store.incrementalSync();
      expect(store.error()).toBe('Failed to sync calendar events');
    });

    it('should skip sync when no syncToken exists', async () => {
      // Reset store to have no sync token
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          CalendarStore,
          { provide: CalendarService, useValue: mockCalendarService },
        ],
      });
      const freshStore = TestBed.inject(CalendarStore);

      await freshStore.incrementalSync();
      expect(mockCalendarService.syncEvents).not.toHaveBeenCalled();
    });
  });

  describe('method: selectDate', () => {
    it('should update selectedDate', () => {
      store.selectDate('2026-03-01');
      expect(store.selectedDate()).toBe('2026-03-01');
    });
  });

  describe('method: setViewMode', () => {
    it('should update viewMode', () => {
      store.setViewMode('dayGridMonth');
      expect(store.viewMode()).toBe('dayGridMonth');
    });

    it('should default to timeGridWeek', () => {
      expect(store.viewMode()).toBe('timeGridWeek');
    });
  });

  describe('method: setDateRange', () => {
    it('should update visibleRangeStart and visibleRangeEnd', () => {
      store.setDateRange('2026-02-10', '2026-02-17');
      expect(store.visibleRangeStart()).toBe('2026-02-10');
      expect(store.visibleRangeEnd()).toBe('2026-02-17');
    });
  });

  describe('computed: eventsForRange', () => {
    it('should return all events when no range is set', async () => {
      await store.initialSync();
      expect(store.eventsForRange().length).toBe(4);
    });

    it('should filter events within visible range', async () => {
      await store.initialSync();
      store.setDateRange('2026-02-16', '2026-02-16');
      const rangeEvents = store.eventsForRange();
      // evt1, evt2 on 2026-02-16, evt4 all-day spanning 2026-02-16 to 2026-02-17
      expect(rangeEvents.length).toBe(3);
    });

    it('should exclude events outside the range', async () => {
      await store.initialSync();
      store.setDateRange('2026-03-01', '2026-03-07');
      expect(store.eventsForRange().length).toBe(0);
    });
  });
});
