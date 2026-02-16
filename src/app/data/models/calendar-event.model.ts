/** A mapped Google Calendar event color */
export interface EventColor {
  name: string;
  hex: string;
}

/** Google Calendar event colorId → Phoenix color mapping */
export const EVENT_COLOR_MAP: Record<string, EventColor> = {
  '1':  { name: 'Lavender',  hex: '#7986CB' },
  '2':  { name: 'Sage',      hex: '#33B679' },
  '3':  { name: 'Grape',     hex: '#8E24AA' },
  '4':  { name: 'Flamingo',  hex: '#E67C73' },
  '5':  { name: 'Banana',    hex: '#F6BF26' },
  '6':  { name: 'Tangerine', hex: '#F4511E' },
  '7':  { name: 'Peacock',   hex: '#039BE5' },
  '8':  { name: 'Graphite',  hex: '#616161' },
  '9':  { name: 'Blueberry', hex: '#3F51B5' },
  '10': { name: 'Basil',     hex: '#0B8043' },
  '11': { name: 'Tomato',    hex: '#D50000' },
};

/** Default color when no colorId is provided (Google's default blue) */
export const DEFAULT_EVENT_COLOR: EventColor = {
  name: 'Default',
  hex: '#4285F4',
};

/** Resolve a Google Calendar colorId to a Phoenix EventColor */
export function getEventColor(colorId: string | null | undefined): EventColor {
  if (!colorId) return DEFAULT_EVENT_COLOR;
  return EVENT_COLOR_MAP[colorId] ?? DEFAULT_EVENT_COLOR;
}

export type EventStatus = 'confirmed' | 'tentative' | 'cancelled';

/** Readonly Phoenix representation of a Google Calendar event */
export interface CalendarEvent {
  readonly id: string;
  readonly summary: string;
  readonly description: string | null;
  readonly start: string;
  readonly end: string;
  readonly allDay: boolean;
  readonly colorId: string | null;
  readonly color: EventColor;
  readonly location: string | null;
  readonly htmlLink: string | null;
  readonly status: EventStatus;
  readonly updatedDateTime: string;
}

/** Google Calendar API event resource (raw shape) */
export interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  colorId?: string;
  location?: string;
  htmlLink?: string;
  status: string;
  updated: string;
}

/** Google Calendar API events.list response */
export interface GoogleCalendarEventsResponse {
  items?: GoogleCalendarEvent[];
  nextSyncToken?: string;
  nextPageToken?: string;
}
