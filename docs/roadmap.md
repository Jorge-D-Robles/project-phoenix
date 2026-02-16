# Roadmap — Web-First Phasing Plan

> Implementation phases for Project Phoenix. Web platform first, Android transposition follows.

---

## Phase 1: Angular Scaffold + Auth

Establish the Angular 21 project and implement OAuth 2.0 PKCE authentication.

### Deliverables

- Initialize Angular 21 CLI workspace with zoneless mode (no zone.js)
- Set up directory structure: `core/`, `data/`, `state/`, `features/`, `shared/`
- Install dependencies: `@ngrx/signals`, `@angular/material`, OAuth library
- Implement `AuthService` with OAuth 2.0 PKCE flow (baseline scopes: `openid`, `email`, `profile`)
- Implement `AuthInterceptor` for token injection and 401 handling
- Create login screen and authenticated shell (top-level layout with navigation)
- Configure Material 3 theme + dark mode toggle via `ThemeService`

### Acceptance Criteria

- [ ] `ng serve` runs without errors
- [ ] User can sign in with Google and see their profile info
- [ ] Access token is attached to outgoing API requests
- [ ] 401 triggers silent token refresh; failed refresh redirects to login
- [ ] Dark mode toggle works and persists preference

---

## Phase 2: Tasks Feature

Integrate Google Tasks API and build the Tasks UI.

### Deliverables

- Implement `TasksStore` (SignalStore) with loading/error/success states
- Build `TaskService` API client (list, create, update, delete, move)
- Implement `TaskParser` for Phoenix metadata extraction/injection
- Create task list view, task detail/edit view, subtask support
- Implement drag-and-drop reordering (uses `moveTask` API)
- Request `tasks` scope incrementally on first access

### Acceptance Criteria

- [ ] Tasks are fetched from Google Tasks API and displayed
- [ ] User can create, edit, complete, and delete tasks
- [ ] Subtasks are supported (nesting via `parent` field)
- [ ] Drag-and-drop reorders tasks (calls `moveTask` with `parent` + `previous`)
- [ ] Phoenix metadata survives round-trips (write → read → write)
- [ ] Pagination handled correctly for large task lists
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
