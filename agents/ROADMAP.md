# Project Phoenix Roadmap

High-level strategic milestones, detailed deliverables, and acceptance criteria.

---

## Phase 1: Angular Scaffold + Auth (Current)

Establish the Angular 21 project and implement OAuth 2.0 PKCE authentication.

### Deliverables

- [x] Initialize Angular 21 CLI workspace with zoneless mode and Karma test runner
- [x] Set up directory structure: `core/`, `data/`, `state/`, `features/`, `shared/`
- [x] Install dependencies: `@ngrx/signals`, `@angular/material`, OAuth library
- [x] Implement `AuthService` with OAuth 2.0 PKCE flow (baseline scopes: `openid`, `email`, `profile`)
- [x] Implement `AuthInterceptor` for token injection and 401 handling
- [x] Create login screen and authenticated shell (top-level layout with navigation)
- [x] Configure Material 3 theme + dark mode toggle via `ThemeService`

### Acceptance Criteria

- [x] `ng serve` runs without errors
- [x] `ng test` runs with Karma/Jasmine and all specs pass
- [x] User can sign in with Google and see their profile info
- [x] Access token is attached to outgoing API requests
- [x] 401 triggers silent token refresh; failed refresh redirects to login
- [x] Dark mode toggle works and persists preference

### Tickets

- [x] PHX-004: Scaffold Angular 21 project (Zoneless + Karma)
- [x] PHX-005: Configure Material 3 Theme & Dark Mode
- [x] PHX-006: Implement OAuth 2.0 PKCE AuthService
- [x] PHX-012: Configure Experimental Zoneless Change Detection
- [x] PHX-013: Refactor `AuthService` to use `SignalStore`

---

## Phase 2: Tasks Feature

Integrate Google Tasks API and build the Tasks UI.

### Deliverables

- [x] Implement `TasksStore` (SignalStore) with loading/error/success states
- [x] Build `TaskService` API client (list, create, update, delete, move)
- [x] Implement `TaskParser` for Phoenix metadata extraction/injection
- [x] Persist `localId` in `TaskMeta` for cross-platform sync
- [x] Create task list view, task detail/edit view, subtask support
- [x] Implement drag-and-drop reordering (uses `moveTask` API)
- Request `tasks` scope incrementally on first access

### Tickets

- [x] PHX-007: Implement `TasksStore` using NgRx Signals
- [x] PHX-008: Build `TaskService` for Google Tasks API
- [x] PHX-010: Implement Phoenix metadata parser for Tasks
- [x] PHX-014: Persist `localId` in `TaskMeta`
- [x] PHX-009: Create Task List and Detail UI components

### Acceptance Criteria

- [x] Tasks are fetched from Google Tasks API and displayed
- [x] User can create, edit, complete, and delete tasks
- [x] Subtasks are supported (nesting via `parent` field)
- [x] Drag-and-drop reorders tasks (calls `moveTask` with `parent` + `previous`)
- [x] Phoenix metadata survives round-trips (write → read → write)
- [x] Pagination handled correctly for large task lists
- [x] 429 responses trigger exponential backoff retry

---

## Phase 3: Calendar Feature

Integrate Google Calendar API for the day/schedule view.

### Deliverables

- [x] Implement `CalendarStore` (SignalStore) with sync token management
- [x] Build `CalendarService` API client (initial sync + incremental sync)
- [x] Create schedule/day view showing events alongside tasks
- [x] Map Google Event colors to Material 3 palette
- [x] Sanitize HTML event descriptions
- Request `calendar.events` scope incrementally

### Tickets

- [x] PHX-022: Create Calendar domain model and event color map
- [x] PHX-023: Build `CalendarService` API client
- [x] PHX-024: Implement `CalendarStore` (SignalStore)
- [x] PHX-025: Build Calendar day view UI components

### Acceptance Criteria

- [x] Events displayed for the current day/week
- [x] Sync token stored and reused for incremental updates
- [x] 410 Gone triggers full re-sync
- [x] Event colors map correctly to the Phoenix palette
- [x] HTML descriptions are sanitized (no XSS)
- [x] Events are read-only (no write-back to Calendar)

---

## Phase 4: Habits Feature

Build the habit tracker with heatmap visualization, backed by Drive appdata.

### Deliverables

- [x] Implement `HabitsStore` (SignalStore) for habit definitions and logs
- [x] Build `HabitService` — CRUD operations on `habits.json` in Drive appdata folder
- [x] Create habit list view (add, edit, archive habits)
- [x] Implement habit logging UI (quick-log today's contribution)
- [x] Build the heatmap visualization (CSS Grid, 365 cells, 4 quartile levels)
- Request `drive.appdata` scope incrementally

### Tickets

- [x] PHX-026: Create Habit domain model and heatmap algorithm
- [x] PHX-027: Build `HabitService` for Drive appdata CRUD
- [x] PHX-028: Implement `HabitsStore` (SignalStore)
- [x] PHX-029: Build Habits UI (list, log, heatmap)

### Acceptance Criteria

- [x] Habits CRUD works (create, read, update, archive)
- [x] Habit logs are sparse arrays stored in appdata
- [x] Heatmap renders 52 weeks of data with correct quartile coloring
- [x] Heatmap performance is smooth (OnPush + signal-based cells)
- [x] Empty state handled (no data = all Level 0)

---

## Phase 5: Notes Feature

Build Phoenix Notes backed by Google Drive.

### Deliverables

- [x] Implement `NotesStore` (SignalStore) for note listing and content
- [x] Build `NoteService` — CRUD on JSON files in `Phoenix_Notes` Drive folder
- [x] Create note list view (grid with color-coded cards, like Keep)
- [x] Create note editor (HTML/Markdown content)
- [x] Support labels and color selection
- Support file attachments (link Drive files)
- Request `drive.file` scope incrementally

### Tickets

- [x] PHX-030: Create Note domain model and color map
- [x] PHX-031: Build `NoteService` for Drive CRUD
- [x] PHX-032: Implement `NotesStore` (SignalStore)
- [x] PHX-033: Build Notes UI (grid, editor, labels)

### Acceptance Criteria

- [x] Notes CRUD works (create, read, update, delete)
- [x] Notes stored as JSON in `Phoenix_Notes` folder in user's Drive
- [x] Note colors match the 11-color enum from the schema
- [x] Labels are searchable/filterable
- [x] Content is sanitized before rendering
- [ ] Attachments link to existing Drive files

---

## Phase 6: Dashboard / Unified Today View

Build the Dashboard as the app's landing page, aggregating all feature data into a single actionable view.

### Deliverables

- [x] Implement `DashboardStore` (SignalStore) aggregating data from Tasks, Calendar, Habits, Notes stores
- [x] Build `GreetingHeader` component (time-of-day greeting, date, completion summary)
- [x] Build `TaskSummaryWidget` (today's tasks + overdue, inline toggle)
- [x] Build `ScheduleTimelineWidget` (today's events in vertical timeline)
- [x] Build `HabitStatusWidget` (today's habit completion status)
- [x] Build `RecentNotesWidget` (last 4 recently modified notes)
- [x] Build `DashboardComponent` (smart container, responsive grid layout)

### Tickets

- [x] PHX-034: Create DashboardStore (SignalStore)
- [x] PHX-035: Build Dashboard UI widgets (greeting, tasks, schedule, habits, notes)
- [x] PHX-036: Build DashboardComponent (smart container with responsive grid)

### Acceptance Criteria

- [x] Dashboard loads data from all four feature stores
- [x] Today's tasks shown (due today + overdue), with inline status toggle
- [x] Today's calendar events shown in chronological order
- [x] Today's habit completion status shown (done vs pending per habit)
- [x] Last 4 recently modified notes shown
- [x] Time-of-day greeting with user name
- [x] Responsive layout (2-column on desktop, single column on mobile)
- [x] All tests pass

---

## Phase 7: Focus Timer (Pomodoro)

Build a Pomodoro focus timer that persists across navigation, with optional task linking and session history.

### Deliverables

- [x] Create `FocusSession` and `FocusSettings` domain models
- [x] Implement `FocusService` (Drive appdata CRUD for focus-sessions.json + focus-settings.json)
- [x] Implement `FocusStore` (SignalStore) with timer state, session history, settings
- [x] Build `FocusTimerComponent` (global toolbar timer: MM:SS, play/pause/stop)
- [x] Build `FocusSettingsDialogComponent` (configure work/break durations)
- [x] Build `TaskLinkSelectorComponent` (autocomplete to link task to session)
- [x] Wire timer into app toolbar so it persists across page navigation

### Tickets

- [x] PHX-037: Create Focus domain models (FocusSession, FocusSettings)
- [x] PHX-038: Build FocusService for Drive appdata CRUD
- [x] PHX-039: Implement FocusStore (SignalStore) with timer logic
- [x] PHX-040: Build Focus Timer UI (toolbar component, settings dialog, task linking)

### Acceptance Criteria

- [x] Timer counts down from configured work duration (default 25 min)
- [x] Timer persists across page navigation (lives in toolbar)
- [x] Work → Break → Work cycle works correctly
- [x] Long break triggers after configured number of work sessions (default 4)
- [x] Sessions saved to Drive appdata on completion
- [x] User can optionally link a task to the current session
- [x] Settings dialog allows configuring all durations
- [x] Pause/Resume/Stop work correctly
- [x] All tests pass

---

## Phase 8: Weekly Review / Productivity Insights

Build an analytics page showing productivity trends, habit streaks, and a composite productivity score.

### Deliverables

- [x] Implement `InsightsStore` (SignalStore) computing analytics from all stores
- [x] Build `ScoreCardComponent` (productivity score with visual indicator)
- [x] Build `TrendChartComponent` (CSS-only bar chart, no external library)
- [x] Build `HabitStreaksWidget` (streak + consistency per habit)
- [x] Build `WeeklySummaryCard` (compact week summary)
- [x] Build `InsightsComponent` (smart container with responsive layout)
- [x] Add `/insights` route to app routing

### Tickets

- [x] PHX-041: Implement InsightsStore (SignalStore) with analytics computations
- [x] PHX-042: Build Insights UI components (score card, trend chart, streaks, summary)
- [x] PHX-043: Build InsightsComponent and wire /insights route

### Acceptance Criteria

- [x] Task completion trend shows last 28 days as bar chart
- [x] Habit streaks calculated correctly (current + longest)
- [x] Calendar density overview shows events per day
- [x] Focus time totals computed from FocusStore
- [x] Productivity score computed using weighted formula (tasks 40%, habits 35%, focus 25%)
- [x] Weekly summary card shows aggregated stats
- [x] Charts rendered with pure CSS (no charting library)
- [x] Responsive layout
- [x] All tests pass

---

## Phase 8.5: Web Feature Polish

Enhance existing web features with richer functionality and better UX.

### Deliverables

- [x] Replace basic calendar day-view with FullCalendar (Day/3-Day/Week/Month views)
- [x] Add event detail dialog with Google Calendar link
- [x] Add task search bar and inline quick-add
- [x] Add due date color-coded chips (overdue/today/upcoming)
- [x] Add note search, pin/archive support, and active/archived tabs
- [x] Add relative timestamps to note cards
- [x] Add global search dialog (Cmd+K / Ctrl+K) across tasks, notes, habits, events
- [x] Add habit streak badges
- [x] Add quick-add task button to dashboard widget

### Tickets

- [x] PHX-044: Install FullCalendar packages
- [x] PHX-045: Extend CalendarStore for multi-view support and date ranges
- [x] PHX-046: Rewrite CalendarComponent with FullCalendar (Day/3-Day/Week/Month)
- [x] PHX-047: Create EventDetailDialogComponent and calendar theme
- [x] PHX-048: Enhance Tasks with search, due date chips, inline quick-add
- [x] PHX-049: Enhance Notes with search, pin/archive, timestamps
- [x] PHX-050: Add global search (Cmd+K) and streak badges to habits

### Acceptance Criteria

- [x] Calendar shows Day, 3-Day, Week, and Month views via FullCalendar
- [x] Clicking an event opens a detail dialog with description and Google link
- [x] Tasks filterable by search query (title match)
- [x] Due dates shown as color-coded chips
- [x] Notes support pin (sorted first) and archive (tab filter)
- [x] Cmd+K opens global search across all features
- [x] Habit cards show streak count when > 0
- [x] All 633 tests pass
- [x] Build succeeds (FullCalendar increases initial bundle size)

---

## Phase 10: New Feature Suite

Expand the web platform with 5 new productivity features.

### Deliverables

- [ ] Gmail Inbox Widget — read-only Gmail integration on dashboard
- [ ] Daily Journal — quick daily journal backed by Notes system
- [ ] Weekly Review Flow — guided multi-step review with Material Stepper
- [ ] Google Meet Links — extract and display Meet links from calendar events
- [ ] Time Blocking / Planner — create calendar events from tasks with planner UI

### Tickets

- [ ] PHX-051: Add Gmail scope to auth config
- [ ] PHX-052: Create Gmail domain model
- [ ] PHX-053: Build GmailService for Gmail API
- [ ] PHX-054: Implement GmailStore (SignalStore)
- [ ] PHX-055: Build GmailWidgetComponent for dashboard
- [ ] PHX-056: Implement JournalStore wrapping NotesStore
- [ ] PHX-057: Build JournalComponent page and JournalWidgetComponent
- [ ] PHX-058: Build WeeklyReviewComponent with stepper and 5 step components
- [ ] PHX-059: Extend CalendarEvent model with meetLink field
- [ ] PHX-060: Update CalendarService to extract conference/meet data
- [ ] PHX-061: Add Join button to ScheduleTimelineWidget and EventDetailDialog
- [ ] PHX-062: Create TimeBlock domain model
- [ ] PHX-063: Add calendar write methods to CalendarService
- [ ] PHX-064: Implement PlannerStore (SignalStore)
- [ ] PHX-065: Build PlannerComponent and TimeBlockColumnComponent
- [ ] PHX-066: Add new routes (/journal, /review, /planner) and nav links
- [ ] PHX-067: Integrate Gmail and Journal widgets into Dashboard

### Acceptance Criteria

- [ ] Gmail widget shows top 5 unread messages with snippets
- [ ] Journal auto-creates today's entry and saves on blur
- [ ] Weekly review stepper walks through 5 review steps
- [ ] Meet links shown as "Join" buttons on calendar events
- [ ] Planner creates Google Calendar events from tasks
- [ ] All new routes accessible from sidebar navigation
- [ ] All tests pass
- [ ] Build succeeds

---

## Phase 9: Android Transposition — DEFERRED

> **Status**: On hold. Focus is exclusively on the web platform for now. Android development will resume at a later date.

Transpose the complete web feature set to native Android.

### Deliverables

- Initialize Kotlin/Compose project with Hilt, Room, Retrofit, WorkManager
- Implement Room entities + TypeConverters for all domain models
- Implement Repository layer (Room local + Retrofit remote)
- Build ViewModels with StateFlow for each feature
- Implement Compose UI for all features (Tasks, Calendar, Habits, Notes, Dashboard, Focus, Insights)
- Implement WorkManager sync engine (Pull → Merge → Push)
- Implement Canvas-based heatmap
- OAuth 2.0 PKCE via Google Identity Services

### Acceptance Criteria

- [ ] App builds and runs on Android 8+ (API 26+)
- [ ] Full offline functionality — all features work without network
- [ ] Background sync runs via WorkManager on 15-minute intervals
- [ ] Room is the single source of truth for UI
- [ ] `isDirty` / `isDeleted` flags used correctly for sync
- [ ] Canvas heatmap renders correctly with drawRect
- [ ] All Google API integrations work (Tasks, Calendar, Drive)
- [ ] Feature parity with web client

---

## Phase Sequencing

```
Phase 1 (Scaffold + Auth) ✅
    └─→ Phase 2 (Tasks) ✅
        └─→ Phase 3 (Calendar) ✅
            └─→ Phase 4 (Habits) ✅
                └─→ Phase 5 (Notes) ✅
                    └─→ Phase 6 (Dashboard) ✅
                        └─→ Phase 7 (Focus Timer) ✅
                            └─→ Phase 8 (Weekly Review) ✅
                                └─→ Phase 8.5 (Web Feature Polish) ✅
                                    └─→ Phase 10 (New Feature Suite) 🚧
                                        └─→ Phase 9 (Android) ⏸ DEFERRED
```

Focus is on continued web platform development. Android is deferred indefinitely.

---

## Project Health

- **Completion**: 100% of core web platform. Phase 10 (New Feature Suite) in progress.
- **Active Phase**: Phase 10 — Gmail Widget, Daily Journal, Weekly Review, Meet Links, Time Blocking
- **Active Platform**: Web (Angular 21) — sole focus
- **Deferred**: Android (Phase 9) — on hold until further notice
- **Primary Risks**: Initial bundle size (910 kB with FullCalendar, exceeds 600 kB budget), Google API quota limits, Gmail API quota
- **Last Audit**: 2026-02-18
- **Status**: 🟡 YELLOW. Phase 10 in active development. 5 new features being implemented in parallel.
