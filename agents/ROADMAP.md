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

- [ ] Implement `DashboardStore` (SignalStore) aggregating data from Tasks, Calendar, Habits, Notes stores
- [ ] Build `GreetingHeader` component (time-of-day greeting, date, completion summary)
- [ ] Build `TaskSummaryWidget` (today's tasks + overdue, inline toggle)
- [ ] Build `ScheduleTimelineWidget` (today's events in vertical timeline)
- [ ] Build `HabitStatusWidget` (today's habit completion status)
- [ ] Build `RecentNotesWidget` (last 4 recently modified notes)
- [ ] Build `DashboardComponent` (smart container, responsive grid layout)

### Tickets

- [ ] PHX-034: Create DashboardStore (SignalStore)
- [ ] PHX-035: Build Dashboard UI widgets (greeting, tasks, schedule, habits, notes)
- [ ] PHX-036: Build DashboardComponent (smart container with responsive grid)

### Acceptance Criteria

- [ ] Dashboard loads data from all four feature stores
- [ ] Today's tasks shown (due today + overdue), with inline status toggle
- [ ] Today's calendar events shown in chronological order
- [ ] Today's habit completion status shown (done vs pending per habit)
- [ ] Last 4 recently modified notes shown
- [ ] Time-of-day greeting with user name
- [ ] Responsive layout (2-column on desktop, single column on mobile)
- [ ] All tests pass

---

## Phase 7: Focus Timer (Pomodoro)

Build a Pomodoro focus timer that persists across navigation, with optional task linking and session history.

### Deliverables

- [ ] Create `FocusSession` and `FocusSettings` domain models
- [ ] Implement `FocusService` (Drive appdata CRUD for focus-sessions.json + focus-settings.json)
- [ ] Implement `FocusStore` (SignalStore) with timer state, session history, settings
- [ ] Build `FocusTimerComponent` (global toolbar timer: MM:SS, play/pause/stop)
- [ ] Build `FocusSettingsDialogComponent` (configure work/break durations)
- [ ] Build `TaskLinkSelectorComponent` (autocomplete to link task to session)
- [ ] Wire timer into app toolbar so it persists across page navigation

### Tickets

- [ ] PHX-037: Create Focus domain models (FocusSession, FocusSettings)
- [ ] PHX-038: Build FocusService for Drive appdata CRUD
- [ ] PHX-039: Implement FocusStore (SignalStore) with timer logic
- [ ] PHX-040: Build Focus Timer UI (toolbar component, settings dialog, task linking)

### Acceptance Criteria

- [ ] Timer counts down from configured work duration (default 25 min)
- [ ] Timer persists across page navigation (lives in toolbar)
- [ ] Work → Break → Work cycle works correctly
- [ ] Long break triggers after configured number of work sessions (default 4)
- [ ] Sessions saved to Drive appdata on completion
- [ ] User can optionally link a task to the current session
- [ ] Settings dialog allows configuring all durations
- [ ] Pause/Resume/Stop work correctly
- [ ] All tests pass

---

## Phase 8: Weekly Review / Productivity Insights

Build an analytics page showing productivity trends, habit streaks, and a composite productivity score.

### Deliverables

- [ ] Implement `InsightsStore` (SignalStore) computing analytics from all stores
- [ ] Build `ScoreCardComponent` (productivity score with visual indicator)
- [ ] Build `TrendChartComponent` (CSS-only bar chart, no external library)
- [ ] Build `HabitStreaksWidget` (streak + consistency per habit)
- [ ] Build `WeeklySummaryCard` (compact week summary)
- [ ] Build `InsightsComponent` (smart container with responsive layout)
- [ ] Add `/insights` route to app routing

### Tickets

- [ ] PHX-041: Implement InsightsStore (SignalStore) with analytics computations
- [ ] PHX-042: Build Insights UI components (score card, trend chart, streaks, summary)
- [ ] PHX-043: Build InsightsComponent and wire /insights route

### Acceptance Criteria

- [ ] Task completion trend shows last 28 days as bar chart
- [ ] Habit streaks calculated correctly (current + longest)
- [ ] Calendar density overview shows events per day
- [ ] Focus time totals computed from FocusStore
- [ ] Productivity score computed using weighted formula (tasks 40%, habits 35%, focus 25%)
- [ ] Weekly summary card shows aggregated stats
- [ ] Charts rendered with pure CSS (no charting library)
- [ ] Responsive layout
- [ ] All tests pass

---

## Phase 9: Android Transposition

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
                    └─→ Phase 6 (Dashboard)
                        └─→ Phase 7 (Focus Timer)
                            └─→ Phase 8 (Weekly Review)
                                └─→ Phase 9 (Android)
```

Each phase builds on the previous. Do not skip phases.

---

## Project Health

- **Completion**: 63%
- **Active Phase**: Phase 6 (Dashboard / Today View)
- **Active Platform**: Web (Angular 21) — expanding feature set
- **Primary Risks**: Bundle size with new features, store interconnection complexity
- **Last Audit**: 2026-02-16
- **Status**: 🟢 GREEN. Phases 1-5 complete (394 tests passing). Three new web features planned: Dashboard Today View, Focus Timer, Weekly Review. Android transposition deferred to Phase 9.
