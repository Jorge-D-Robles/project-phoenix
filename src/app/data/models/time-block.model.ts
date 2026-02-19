/** A time block linking a task to a calendar event */
export interface TimeBlock {
  readonly id: string;
  readonly taskId: string | null;
  readonly title: string;
  readonly start: string;
  readonly end: string;
  readonly colorId: string | null;
}

/** Body for creating a Google Calendar event */
export interface CreateEventBody {
  readonly summary: string;
  readonly start: { readonly dateTime: string };
  readonly end: { readonly dateTime: string };
  readonly description?: string;
  readonly colorId?: string;
}

/** Response from Google Calendar event creation */
export interface GoogleCalendarEventResponse {
  readonly id: string;
  readonly summary?: string;
  readonly start: { readonly dateTime?: string; readonly date?: string };
  readonly end: { readonly dateTime?: string; readonly date?: string };
  readonly colorId?: string;
  readonly status: string;
  readonly htmlLink?: string;
}
