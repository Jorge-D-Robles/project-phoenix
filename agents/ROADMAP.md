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
- Implement drag-and-drop reordering (uses `moveTask` API)
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
- [ ] Drag-and-drop reorders tasks (calls `moveTask` with `parent` + `previous`)
- [x] Phoenix metadata survives round-trips (write → read → write)
- [x] Pagination handled correctly for large task lists
- [ ] 429 responses trigger exponential backoff retry

---

## Phase 3: Calendar Feature

Integrate Google Calendar API for the day/schedule view.

### Deliverables

- Implement `CalendarStore` (SignalStore) with sync token management
- Build `CalendarService` API client (initial sync + incremental sync)
- Create schedule/day view showing events alongside tasks
- Map Google Event colors to Material 3 palette
- Sanitize HTML event descriptions
- Request `calendar.events` scope incrementally

### Acceptance Criteria

- [ ] Events displayed for the current day/week
- [ ] Sync token stored and reused for incremental updates
- [ ] 410 Gone triggers full re-sync
- [ ] Event colors map correctly to the Phoenix palette
- [ ] HTML descriptions are sanitized (no XSS)
- [ ] Events are read-only (no write-back to Calendar)

---

## Phase 4: Habits Feature

Build the habit tracker with heatmap visualization, backed by Drive appdata.

### Deliverables

- Implement `HabitsStore` (SignalStore) for habit definitions and logs
- Build `HabitService` — CRUD operations on `habits.json` in Drive appdata folder
- Create habit list view (add, edit, archive habits)
- Implement habit logging UI (quick-log today's contribution)
- Build the heatmap visualization (CSS Grid, 365 cells, 4 quartile levels)
- Request `drive.appdata` scope incrementally

### Acceptance Criteria

- [ ] Habits CRUD works (create, read, update, archive)
- [ ] Habit logs are sparse arrays stored in appdata
- [ ] Heatmap renders 52 weeks of data with correct quartile coloring
- [ ] Heatmap performance is smooth (OnPush + signal-based cells)
- [ ] Empty state handled (no data = all Level 0)

---

## Phase 5: Notes Feature

Build Phoenix Notes backed by Google Drive.

### Deliverables

- Implement `NotesStore` (SignalStore) for note listing and content
- Build `NoteService` — CRUD on JSON files in `Phoenix_Notes` Drive folder
- Create note list view (grid with color-coded cards, like Keep)
- Create note editor (HTML/Markdown content)
- Support labels and color selection
- Support file attachments (link Drive files)
- Request `drive.file` scope incrementally

### Acceptance Criteria

- [ ] Notes CRUD works (create, read, update, delete)
- [ ] Notes stored as JSON in `Phoenix_Notes` folder in user's Drive
- [ ] Note colors match the 11-color enum from the schema
- [ ] Labels are searchable/filterable
- [ ] Content is sanitized before rendering
- [ ] Attachments link to existing Drive files

---

## Phase 6: Android Transposition

Transpose the complete web feature set to native Android.

### Deliverables

- Initialize Kotlin/Compose project with Hilt, Room, Retrofit, WorkManager
- Implement Room entities + TypeConverters for all domain models
- Implement Repository layer (Room local + Retrofit remote)
- Build ViewModels with StateFlow for each feature
- Implement Compose UI for all features (Tasks, Calendar, Habits, Notes)
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
Phase 1 (Scaffold + Auth)
    └─→ Phase 2 (Tasks)
        └─→ Phase 3 (Calendar)
            └─→ Phase 4 (Habits)
                └─→ Phase 5 (Notes)
                    └─→ Phase 6 (Android)
```

Each phase builds on the previous. Do not skip phases.

---

## Project Health

- **Completion**: 25%
- **Active Phase**: Phase 2 — Tasks Feature
- **Active Platform**: Web (Angular 21)
- **Primary Risks**: Google API Quota limits, OAuth flow complexity on Android
- **Last Audit**: 2026-02-16 (Gemini)
- **Status**: 🟢 GREEN. Phase 2 Data Layer complete and stabilized. Zoneless detection, localId persistence, and test coverage improved.
