# Phase 10 — New Feature Suite

> Five new productivity features extending the Phoenix web platform.

---

## Feature 1: Gmail Inbox Widget

### Overview
Read-only Gmail integration showing unread inbox messages on the dashboard.

### OAuth Scope
- `https://www.googleapis.com/auth/gmail.readonly` — provides message snippets

Add to `GOOGLE_SCOPES` in `auth.config.ts`:
```ts
gmail: 'https://www.googleapis.com/auth/gmail.readonly',
```

### API Endpoints

| Operation | Method | Endpoint | Notes |
|-----------|--------|----------|-------|
| List messages | GET | `gmail/v1/users/me/messages` | `q=is:unread in:inbox`, `maxResults=10` |
| Get message | GET | `gmail/v1/users/me/messages/{id}` | `format=metadata`, `metadataHeaders=From,Subject,Date` |
| Get profile | GET | `gmail/v1/users/me/profile` | Returns `messagesTotal`, `threadsTotal` |

### Domain Model

```ts
interface GmailMessage {
  readonly id: string;
  readonly threadId: string;
  readonly from: string;       // parsed from headers
  readonly subject: string;    // parsed from headers
  readonly snippet: string;    // from message resource
  readonly date: string;       // ISO 8601
  readonly isUnread: boolean;
}

interface GmailState {
  readonly messages: GmailMessage[];
  readonly unreadCount: number;
  readonly loading: boolean;
  readonly error: string | null;
}
```

### Store: `GmailStore`
- `providedIn: 'root'`
- `withState(initialState)`
- `withComputed`: `recentMessages` (top 5), `hasUnread`
- `withMethods`: `loadInbox()`, `refresh()`

### Service: `GmailService`
- `listUnreadMessages()` — fetches message IDs, then batch-gets metadata
- `getUnreadCount()` — from profile endpoint
- Maps raw Gmail API responses to `GmailMessage[]`

### Components

**`GmailWidgetComponent`** (dashboard widget):
- Mat card with inbox icon + unread count badge
- List of 5 most recent messages (from, subject, snippet truncated)
- "Open Gmail" external link button
- Empty state: "No unread messages"

### Files
- `src/app/data/models/gmail.model.ts`
- `src/app/data/gmail.service.ts`
- `src/app/state/gmail.store.ts`
- `src/app/features/dashboard/gmail-widget.component.ts`

---

## Feature 2: Daily Journal

### Overview
Quick daily journal backed by the existing Notes system. Auto-creates today's journal note with a `journal` label.

### Domain Model
Reuses existing `Note` model. Journal entries are Notes with:
- `labels: ['journal']`
- `title`: formatted as `Journal — YYYY-MM-DD`

### Store: `JournalStore`
Wraps `NotesStore`:
- `todayEntry` computed: finds note with `journal` label and today's date in title
- `recentEntries` computed: last 7 journal notes sorted by date
- `ensureTodayEntry()`: creates today's note if it doesn't exist
- `updateEntry(content)`: updates today's note content

```ts
interface JournalState {
  readonly loading: boolean;
  readonly error: string | null;
}
```

### Components

**`JournalWidgetComponent`** (dashboard):
- Compact textarea for quick entry
- Shows "Write in your journal..." placeholder
- Auto-saves on blur or after 2s debounce

**`JournalComponent`** (full page at `/journal`):
- Left sidebar: list of past journal entries by date
- Main area: rich text editor for selected entry
- "Today" button jumps to today's entry

### Files
- `src/app/state/journal.store.ts`
- `src/app/features/journal/journal.component.ts`
- `src/app/features/dashboard/journal-widget.component.ts`

---

## Feature 3: Weekly Review Flow

### Overview
Guided multi-step weekly review using Angular Material Stepper.

### Steps
1. **Review Tasks** — Show this week's completed/incomplete tasks with stats
2. **Review Habits** — Show habit streaks and consistency for the week
3. **Review Calendar** — Show this week's event density and time spent
4. **Plan Next Week** — Textarea for goals/priorities (saved as a note with `weekly-review` label)
5. **Summary** — Composite view with productivity score and key metrics

### Store
No new store — uses `InsightsStore.weekSummary`, `TasksStore`, `HabitsStore`, `CalendarStore` directly.

### Components

**`WeeklyReviewComponent`** (smart container at `/review`):
- `mat-stepper` with 5 steps
- Each step is a sub-component

**Step components:**
- `ReviewTasksStepComponent` — task completion list + stats
- `ReviewHabitsStepComponent` — habit streaks + consistency bars
- `ReviewCalendarStepComponent` — event summary + time breakdown
- `ReviewPlanStepComponent` — textarea for next week goals
- `ReviewSummaryStepComponent` — score card + key metrics

### Files
- `src/app/features/review/weekly-review.component.ts`
- `src/app/features/review/review-tasks-step.component.ts`
- `src/app/features/review/review-habits-step.component.ts`
- `src/app/features/review/review-calendar-step.component.ts`
- `src/app/features/review/review-plan-step.component.ts`
- `src/app/features/review/review-summary-step.component.ts`

---

## Feature 4: Google Meet Links

### Overview
Extract Google Meet / conference links from calendar events and display "Join" buttons.

### Model Extension

Add to `GoogleCalendarEvent`:
```ts
readonly hangoutLink?: string;
readonly conferenceData?: {
  readonly entryPoints?: readonly {
    readonly entryPointType: string;
    readonly uri: string;
  }[];
};
```

Add to `CalendarEvent`:
```ts
readonly meetLink: string | null;
```

### Mapping Logic (in `CalendarService.mapEvent`):
```ts
const meetLink = extractMeetLink(raw);

function extractMeetLink(raw: GoogleCalendarEvent): string | null {
  // Prefer conferenceData video entry point
  const videoEntry = raw.conferenceData?.entryPoints?.find(
    ep => ep.entryPointType === 'video'
  );
  if (videoEntry?.uri) return videoEntry.uri;
  // Fallback to hangoutLink
  return raw.hangoutLink ?? null;
}
```

### UI Changes

**`ScheduleTimelineWidgetComponent`**: Add "Join" icon-button when `event.meetLink` exists.

**`EventDetailDialogComponent`**: Add "Join Meeting" button with external link.

### Files Modified
- `src/app/data/models/calendar-event.model.ts` — add `meetLink` field
- `src/app/data/calendar.service.ts` — extract conference data
- `src/app/features/dashboard/schedule-timeline-widget.component.ts` — Join button
- `src/app/features/calendar/event-detail-dialog.component.ts` — Join button

---

## Feature 5: Time Blocking / Planner

### Overview
Create calendar events from tasks. Side-by-side planner view with task list + day calendar.

### OAuth Scope
Calendar write uses the same scope already requested: `calendar.events` — but now we use POST/PATCH in addition to GET.

### API Endpoints

| Operation | Method | Endpoint | Notes |
|-----------|--------|----------|-------|
| Create event | POST | `calendar/v3/calendars/primary/events` | Returns created event |
| Update event | PATCH | `calendar/v3/calendars/primary/events/{id}` | Partial update |
| Delete event | DELETE | `calendar/v3/calendars/primary/events/{id}` | Permanent delete |

### Domain Model

```ts
interface TimeBlock {
  readonly id: string;           // Google Calendar event ID
  readonly taskId: string | null; // linked Phoenix task
  readonly title: string;
  readonly start: string;         // ISO 8601
  readonly end: string;           // ISO 8601
  readonly colorId: string | null;
}

interface PlannerState {
  readonly timeBlocks: TimeBlock[];
  readonly selectedDate: string;
  readonly loading: boolean;
  readonly error: string | null;
}
```

### Service Extension: `CalendarService`
Add methods:
- `createEvent(event)` — POST to Calendar API
- `updateEvent(id, event)` — PATCH
- `deleteEvent(id)` — DELETE

### Store: `PlannerStore`
- Reads unscheduled tasks from `TasksStore`
- Reads today's events from `CalendarStore`
- Methods: `createTimeBlock(taskId, start, end)`, `removeTimeBlock(id)`, `updateTimeBlock(id, changes)`

### Components

**`PlannerComponent`** (smart container at `/planner`):
- Two-panel layout: task list (left) + day timeline (right)
- Date picker in header
- Drag from task list to timeline to create time block

**`TimeBlockColumnComponent`** (day timeline):
- Vertical hour grid (8am–8pm)
- Time blocks rendered as positioned cards
- Click to edit/delete

### Files
- `src/app/data/models/time-block.model.ts`
- `src/app/state/planner.store.ts`
- `src/app/features/planner/planner.component.ts`
- `src/app/features/planner/time-block-column.component.ts`

---

## Shared Changes

### Routes (`app.routes.ts`)
Add:
- `/journal` → `JournalComponent`
- `/review` → `WeeklyReviewComponent`
- `/planner` → `PlannerComponent`

### Navigation (`app.component.ts`)
Add nav links:
- Journal (icon: `auto_stories`)
- Review (icon: `rate_review`)
- Planner (icon: `view_timeline`)

### Dashboard (`dashboard.component.ts`)
Add widgets:
- `GmailWidgetComponent`
- `JournalWidgetComponent`

### Auth Config (`auth.config.ts`)
Add Gmail scope:
```ts
gmail: 'https://www.googleapis.com/auth/gmail.readonly',
```

### Google API Spec (`docs/google-api-spec.md`)
Add sections:
- Gmail API (messages.list, messages.get)
- Calendar write (events.insert, events.update, events.delete)
