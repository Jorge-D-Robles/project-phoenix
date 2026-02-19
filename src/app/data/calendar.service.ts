import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, expand, EMPTY, map, reduce } from 'rxjs';

import type { CreateEventBody, GoogleCalendarEventResponse } from './models/time-block.model';
import type { EventStatus } from './models/calendar-event.model';
import {
  CalendarEvent,
  GoogleCalendarEvent,
  GoogleCalendarEventsResponse,
  getEventColor,
  extractMeetLink,
} from './models/calendar-event.model';
import { sanitizeHtml } from '../shared/sanitize-html.util';

const BASE_URL = 'https://www.googleapis.com/calendar/v3';
const CALENDAR_ID = 'primary';
const DAYS_BACK = 30;
const DAYS_FORWARD = 90;

export interface CalendarSyncResult {
  readonly events: CalendarEvent[];
  readonly syncToken: string | null;
}

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly http = inject(HttpClient);

  /** Initial sync: fetch events within a time window and return sync token */
  getEvents(now: Date): Observable<CalendarSyncResult> {
    const timeMin = new Date(now.getTime() - DAYS_BACK * 24 * 60 * 60 * 1000);
    const timeMax = new Date(now.getTime() + DAYS_FORWARD * 24 * 60 * 60 * 1000);

    const baseParams = new HttpParams()
      .set('timeMin', timeMin.toISOString())
      .set('timeMax', timeMax.toISOString())
      .set('singleEvents', 'true')
      .set('orderBy', 'startTime');

    return this.fetchAllPages(baseParams).pipe(
      map(({ events, syncToken }) => ({
        events: events.filter(e => e.status !== 'cancelled'),
        syncToken,
      })),
    );
  }

  /** Incremental sync: fetch only changed events since last sync token */
  syncEvents(syncToken: string): Observable<CalendarSyncResult> {
    const params = new HttpParams().set('syncToken', syncToken);

    return this.fetchAllPages(params);
  }

  private fetchAllPages(baseParams: HttpParams): Observable<CalendarSyncResult> {
    const fetchPage = (pageToken?: string) => {
      const params = pageToken ? baseParams.set('pageToken', pageToken) : baseParams;
      return this.http.get<GoogleCalendarEventsResponse>(
        `${BASE_URL}/calendars/${CALENDAR_ID}/events`,
        { params },
      );
    };

    return fetchPage().pipe(
      expand(res => res.nextPageToken ? fetchPage(res.nextPageToken) : EMPTY),
      reduce(
        (acc: { events: CalendarEvent[]; syncToken: string | null }, res) => {
          const mapped = (res.items ?? []).map(raw => this.mapEvent(raw));
          return {
            events: [...acc.events, ...mapped],
            syncToken: res.nextSyncToken ?? acc.syncToken,
          };
        },
        { events: [], syncToken: null },
      ),
    );
  }

  private mapEvent(raw: GoogleCalendarEvent): CalendarEvent {
    const allDay = !raw.start.dateTime;
    return {
      id: raw.id,
      summary: raw.summary ?? '(No title)',
      description: raw.description ? sanitizeHtml(raw.description) : null,
      start: allDay ? raw.start.date! : raw.start.dateTime!,
      end: allDay ? raw.end.date! : raw.end.dateTime!,
      allDay,
      colorId: raw.colorId ?? null,
      color: getEventColor(raw.colorId),
      location: raw.location ?? null,
      htmlLink: raw.htmlLink ?? null,
      status: toEventStatus(raw.status),
      updatedDateTime: raw.updated,
      meetLink: extractMeetLink(raw),
    };
  }

  /** Create a new calendar event */
  createEvent(body: CreateEventBody): Observable<GoogleCalendarEventResponse> {
    return this.http.post<GoogleCalendarEventResponse>(
      `${BASE_URL}/calendars/${CALENDAR_ID}/events`,
      body,
    );
  }

  /** Update an existing calendar event (partial update) */
  updateEvent(eventId: string, body: Partial<CreateEventBody>): Observable<GoogleCalendarEventResponse> {
    return this.http.patch<GoogleCalendarEventResponse>(
      `${BASE_URL}/calendars/${CALENDAR_ID}/events/${eventId}`,
      body,
    );
  }

  /** Delete a calendar event */
  deleteEvent(eventId: string): Observable<void> {
    return this.http.delete<void>(
      `${BASE_URL}/calendars/${CALENDAR_ID}/events/${eventId}`,
    );
  }
}


function toEventStatus(status: string): EventStatus {
  if (status === 'confirmed' || status === 'tentative' || status === 'cancelled') {
    return status;
  }
  return 'confirmed';
}
