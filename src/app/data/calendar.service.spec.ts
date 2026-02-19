import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { CalendarService, CalendarSyncResult } from './calendar.service';
import { extractMeetLink } from './models/calendar-event.model';
import type { GoogleCalendarEvent } from './models/calendar-event.model';

const BASE_URL = 'https://www.googleapis.com/calendar/v3';
const CALENDAR_ID = 'primary';

function makeGoogleEvent(overrides: Partial<GoogleCalendarEvent> = {}): GoogleCalendarEvent {
  return {
    id: 'evt1',
    summary: 'Team Standup',
    description: '<b>Daily sync</b>',
    start: { dateTime: '2026-02-16T09:00:00Z' },
    end: { dateTime: '2026-02-16T09:30:00Z' },
    colorId: '7',
    location: 'Room 42',
    htmlLink: 'https://calendar.google.com/event?eid=abc',
    status: 'confirmed',
    updated: '2026-02-15T12:00:00Z',
    ...overrides,
  };
}

describe('CalendarService', () => {
  let service: CalendarService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CalendarService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(CalendarService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  describe('initial sync (getEvents)', () => {
    it('should fetch events with timeMin and timeMax params', () => {
      const now = new Date('2026-02-16T12:00:00Z');

      service.getEvents(now).subscribe();

      const req = httpTesting.expectOne(r =>
        r.url === `${BASE_URL}/calendars/${CALENDAR_ID}/events` &&
        r.method === 'GET',
      );

      expect(req.request.params.has('timeMin')).toBeTrue();
      expect(req.request.params.has('timeMax')).toBeTrue();
      expect(req.request.params.get('singleEvents')).toBe('true');
      expect(req.request.params.get('orderBy')).toBe('startTime');
      req.flush({ items: [] });
    });

    it('should use timeMin = now - 30 days and timeMax = now + 90 days', () => {
      const now = new Date('2026-02-16T12:00:00Z');

      service.getEvents(now).subscribe();

      const req = httpTesting.expectOne(r =>
        r.url === `${BASE_URL}/calendars/${CALENDAR_ID}/events`,
      );

      const timeMin = req.request.params.get('timeMin')!;
      const timeMax = req.request.params.get('timeMax')!;

      const minDate = new Date(timeMin);
      const maxDate = new Date(timeMax);

      // timeMin should be ~30 days before now
      const diffMin = (now.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffMin).toBeCloseTo(30, 0);

      // timeMax should be ~90 days after now
      const diffMax = (maxDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffMax).toBeCloseTo(90, 0);

      req.flush({ items: [] });
    });

    it('should map Google events to CalendarEvent entities', () => {
      const now = new Date('2026-02-16T12:00:00Z');
      let result: CalendarSyncResult;

      service.getEvents(now).subscribe(r => result = r);

      const req = httpTesting.expectOne(r =>
        r.url === `${BASE_URL}/calendars/${CALENDAR_ID}/events`,
      );

      req.flush({
        items: [makeGoogleEvent()],
        nextSyncToken: 'sync-token-123',
      });

      expect(result!.events.length).toBe(1);
      expect(result!.events[0].id).toBe('evt1');
      expect(result!.events[0].summary).toBe('Team Standup');
      expect(result!.events[0].start).toBe('2026-02-16T09:00:00Z');
      expect(result!.events[0].end).toBe('2026-02-16T09:30:00Z');
      expect(result!.events[0].allDay).toBeFalse();
      expect(result!.events[0].color.name).toBe('Peacock');
      expect(result!.events[0].location).toBe('Room 42');
      expect(result!.events[0].status).toBe('confirmed');
      expect(result!.syncToken).toBe('sync-token-123');
    });

    it('should handle all-day events (date instead of dateTime)', () => {
      const now = new Date('2026-02-16T12:00:00Z');
      let result: CalendarSyncResult;

      service.getEvents(now).subscribe(r => result = r);

      const req = httpTesting.expectOne(r =>
        r.url === `${BASE_URL}/calendars/${CALENDAR_ID}/events`,
      );

      req.flush({
        items: [makeGoogleEvent({
          start: { date: '2026-02-16' },
          end: { date: '2026-02-17' },
        })],
      });

      expect(result!.events[0].allDay).toBeTrue();
      expect(result!.events[0].start).toBe('2026-02-16');
      expect(result!.events[0].end).toBe('2026-02-17');
    });

    it('should sanitize HTML descriptions', () => {
      const now = new Date('2026-02-16T12:00:00Z');
      let result: CalendarSyncResult;

      service.getEvents(now).subscribe(r => result = r);

      const req = httpTesting.expectOne(r =>
        r.url === `${BASE_URL}/calendars/${CALENDAR_ID}/events`,
      );

      req.flush({
        items: [makeGoogleEvent({
          description: '<b>Bold</b><script>alert("xss")</script><a href="https://example.com">Link</a>',
        })],
      });

      // Script tags should be stripped; safe tags preserved
      const desc = result!.events[0].description;
      expect(desc).not.toContain('<script>');
      expect(desc).toContain('<b>Bold</b>');
      expect(desc).toContain('<a href="https://example.com">Link</a>');
    });

    it('should handle null/undefined descriptions', () => {
      const now = new Date('2026-02-16T12:00:00Z');
      let result: CalendarSyncResult;

      service.getEvents(now).subscribe(r => result = r);

      const req = httpTesting.expectOne(r =>
        r.url === `${BASE_URL}/calendars/${CALENDAR_ID}/events`,
      );

      req.flush({
        items: [makeGoogleEvent({ description: undefined })],
      });

      expect(result!.events[0].description).toBeNull();
    });

    it('should handle pagination via nextPageToken', () => {
      const now = new Date('2026-02-16T12:00:00Z');
      let result: CalendarSyncResult;

      service.getEvents(now).subscribe(r => result = r);

      // First page
      const req1 = httpTesting.expectOne(r =>
        r.url === `${BASE_URL}/calendars/${CALENDAR_ID}/events` &&
        !r.params.has('pageToken'),
      );
      req1.flush({
        items: [makeGoogleEvent({ id: 'evt1' })],
        nextPageToken: 'page2',
      });

      // Second page
      const req2 = httpTesting.expectOne(r =>
        r.url === `${BASE_URL}/calendars/${CALENDAR_ID}/events` &&
        r.params.get('pageToken') === 'page2',
      );
      req2.flush({
        items: [makeGoogleEvent({ id: 'evt2' })],
        nextSyncToken: 'final-sync-token',
      });

      expect(result!.events.length).toBe(2);
      expect(result!.syncToken).toBe('final-sync-token');
    });

    it('should filter out cancelled events', () => {
      const now = new Date('2026-02-16T12:00:00Z');
      let result: CalendarSyncResult;

      service.getEvents(now).subscribe(r => result = r);

      const req = httpTesting.expectOne(r =>
        r.url === `${BASE_URL}/calendars/${CALENDAR_ID}/events`,
      );

      req.flush({
        items: [
          makeGoogleEvent({ id: 'evt1', status: 'confirmed' }),
          makeGoogleEvent({ id: 'evt2', status: 'cancelled' }),
        ],
      });

      expect(result!.events.length).toBe(1);
      expect(result!.events[0].id).toBe('evt1');
    });
  });

  describe('extractMeetLink', () => {
    it('should extract meet link from conferenceData', () => {
      const raw = {
        id: '1', summary: 'Meeting', start: { dateTime: '2026-02-18T10:00:00Z' },
        end: { dateTime: '2026-02-18T11:00:00Z' }, status: 'confirmed', updated: '2026-02-18T10:00:00Z',
        conferenceData: { entryPoints: [{ entryPointType: 'video', uri: 'https://meet.google.com/abc' }] },
      };
      expect(extractMeetLink(raw as any)).toBe('https://meet.google.com/abc');
    });

    it('should fallback to hangoutLink when no conferenceData', () => {
      const raw = {
        id: '1', summary: 'Meeting', start: { dateTime: '2026-02-18T10:00:00Z' },
        end: { dateTime: '2026-02-18T11:00:00Z' }, status: 'confirmed', updated: '2026-02-18T10:00:00Z',
        hangoutLink: 'https://meet.google.com/xyz',
      };
      expect(extractMeetLink(raw as any)).toBe('https://meet.google.com/xyz');
    });

    it('should return null when no meet link available', () => {
      const raw = {
        id: '1', summary: 'Meeting', start: { dateTime: '2026-02-18T10:00:00Z' },
        end: { dateTime: '2026-02-18T11:00:00Z' }, status: 'confirmed', updated: '2026-02-18T10:00:00Z',
      };
      expect(extractMeetLink(raw as any)).toBeNull();
    });
  });

  describe('incremental sync (syncEvents)', () => {
    it('should fetch events using syncToken', () => {
      service.syncEvents('sync-token-123').subscribe();

      const req = httpTesting.expectOne(r =>
        r.url === `${BASE_URL}/calendars/${CALENDAR_ID}/events` &&
        r.params.get('syncToken') === 'sync-token-123',
      );

      expect(req.request.method).toBe('GET');
      req.flush({ items: [] });
    });

    it('should return updated events and new syncToken', () => {
      let result: CalendarSyncResult;

      service.syncEvents('old-token').subscribe(r => result = r);

      const req = httpTesting.expectOne(r =>
        r.params.get('syncToken') === 'old-token',
      );

      req.flush({
        items: [makeGoogleEvent({ id: 'updated-evt' })],
        nextSyncToken: 'new-token',
      });

      expect(result!.events.length).toBe(1);
      expect(result!.events[0].id).toBe('updated-evt');
      expect(result!.syncToken).toBe('new-token');
    });

    it('should include cancelled events in sync results (for deletion tracking)', () => {
      let result: CalendarSyncResult;

      service.syncEvents('token').subscribe(r => result = r);

      const req = httpTesting.expectOne(r =>
        r.params.get('syncToken') === 'token',
      );

      req.flush({
        items: [makeGoogleEvent({ id: 'evt1', status: 'cancelled' })],
        nextSyncToken: 'new-token',
      });

      // Cancelled events are kept in sync responses so the store can remove them
      expect(result!.events.length).toBe(1);
      expect(result!.events[0].status).toBe('cancelled');
    });
  });
});
