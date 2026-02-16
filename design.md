# PROJECT PHOENIX: UNIFIED PRODUCTIVITY ECOSYSTEM
## TECHNICAL SPECIFICATION

---

## 1. Architectural Vision and System Design Principles

### 1.1 Executive Summary and System Philosophy
Project Phoenix represents a paradigm shift in personal productivity software, moving away from fragmented, siloed applications toward a unified **"Client-Centric Aggregator"** model. The core objective is to synthesize disparate information streams—specifically Google Tasks, Calendar events, Keep-style notes, and Google Docs—into a single, coherent operational dashboard. This system is distinct in its inclusion of a GitHub-style habit tracking heatmap, merging quantitative behavioral data with qualitative task management.

The architecture is predicated on an **"Agent-First"** design philosophy. This document serves not merely as a guide for human developers but as a deterministic instruction set for autonomous AI software engineering agents. Consequently, the specification prioritizes explicit state management patterns, strict typing systems, and verifiable data contracts over abstract user stories. The system targets two distinct client platforms: a Progressive Web Application (PWA) leveraging Angular 21+ with Signals, and a native Android application built with Kotlin and Jetpack Compose. These platforms are linked not by a proprietary backend, but by a shared data ontology and direct integration with Google Workspace APIs, ensuring user data sovereignty and privacy.

### 1.2 The Client-Centric Aggregator Model
Traditional SaaS architectures typically rely on a proprietary intermediary server to proxy requests between the client and third-party APIs. Project Phoenix rejects this model in favor of a **"thick client"** architecture where the browser (Web) or device (Android) acts as the primary orchestration engine. This decision mitigates infrastructure costs and enhances privacy, as data resides either on the user's local device or within their authenticated Google storage.

In this model, the application logic is responsible for maintaining a **"Local Source of Truth"** that is optimistically synchronized with the **"Remote Source of Truth"** (Google's servers). The complexity of this architecture lies in the synchronization engine, which must handle network partitions, rate limiting, and data conflict resolution without a central coordination server. The system treats the Google Drive "Application Data Folder" as a pseudo-backend for storing configuration state and non-API-supported data types, such as the habit tracker logs and proprietary note formats.

### 1.3 Cross-Platform Technology Stack
The technology selection for Project Phoenix is driven by the requirement for robust typing, reactive state management, and offline capability.

#### Web Platform (Angular 21+)
The frontend utilizes **Angular 21**, specifically leveraging the new reactivity primitives (**Signals**) to eliminate the overhead of zone.js. This choice aligns with the industry trend toward fine-grained reactivity, offering superior performance for the complex DOM manipulations required by the habit heatmap. The build system relies on `esbuild` for rapid compilation, ensuring the development lifecycle remains efficient for AI agents iterating on code.

#### Android Platform (Native Kotlin)
The mobile client is a native Android application, avoiding cross-platform frameworks like Flutter or React Native to ensure maximum performance and seamless integration with system-level features like widgets and background sync services. The UI is built entirely in **Jetpack Compose**, mapping the declarative paradigms of Angular to Kotlin. The **"Offline-First"** requirement mandates the use of **Room Persistence Library (SQLite)** as the single source of truth for the UI, with **WorkManager** handling asynchronous synchronization.

### 1.4 Agentic Implementation Strategy
This specification is structured to be consumed by AI agents. Agents operate most effectively when given **"Guardrails"** and **"Structured Context"**. Therefore, this document provides:
*   **Semantic Data Models**: JSON schemas that define the exact shape of every entity.
*   **Deterministic State Transitions**: Explicit rules for how data moves from "Loading" to "Success" or "Error" states.
*   **Transposition Mapping**: A precise dictionary mapping Web concepts (Services, Signals) to Android concepts (Repositories, StateFlows) to facilitate code translation.

---

## 2. Domain Modeling and Data Ontology
The integrity of Project Phoenix relies on a rigorous data ontology that normalizes the eccentricities of external APIs into a coherent internal schema. These models serve as the contract for both the Angular interfaces and the Kotlin data classes.

### 2.1 The Unified Task Entity
The Task entity is the atomic unit of the system. It aggregates fields from Google Tasks while appending metadata required for the Phoenix ecosystem, such as habit association and rich-text linking. Since Google Tasks does not natively support custom metadata fields in its standard API, we utilize a **"description-packing"** strategy where metadata is serialized into a JSON string and appended to the task's notes field, delimited by a unique marker.

#### Schema Definition
The internal representation of a task must strictly adhere to the following structure. Agents must ensure that all date-time fields are normalized to ISO 8601 UTC strings before persistence or transmission.

| Field Name | Data Type | Nullable | Source | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String | No | Google | The unique identifier provided by the Google Tasks API. |
| `localId` | String | No | Phoenix | A UUID v4 generated locally to track optimistic creations before server sync. |
| `title` | String | No | Google | The user-facing content of the task. |
| `status` | Enum | No | Google | Values: `needsAction`, `completed`. Maps to internal booleans. |
| `dueDateTime` | String | Yes | Google | RFC 3339 timestamp. Note: Google Tasks API often discards time, keeping only date. |
| `notes` | String | Yes | Google | The raw text description. Contains the "Phoenix Meta Block" at the end. |
| `meta` | Object | Yes | Phoenix | Parsed JSON object containing `habitId`, `docLinks`, and `tags`. |
| `parent` | String | Yes | Google | ID of the parent task if this is a subtask. |
| `position` | String | No | Google | Lexicographical string used for sorting order among siblings. |
| `updatedDateTime`| String | No | Google | Timestamp of the last server-side modification. |
| `isDirty` | Boolean | No | Phoenix | Flag indicating local modification not yet synced to server (Android only). |
| `isDeleted` | Boolean | No | Phoenix | Soft-delete flag for sync resolution (Android only). |

> **Implications for Agents:**
> When implementing the `TaskParser` skill, the agent must write regex logic to extract the meta object from the notes field. The pattern to be used is `\n---PHOENIX_META---\n{...json...}`. This ensures that the metadata remains invisible to the casual user in the standard Google Tasks interface while being machine-readable by Project Phoenix.

### 2.2 The Habit Definition and Log Entity
Habit tracking is a proprietary feature of Phoenix, as it does not map directly to a Google API. These entities are stored in a `habits.json` file located in the user's Google Drive Application Data Folder.

#### Habit Definition Schema
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "title": { "type": "string", "minLength": 1 },
    "frequency": { "type": "string", "enum": ["DAILY", "WEEKLY", "MONTHLY"] },
    "targetValue": { "type": "integer", "minimum": 1, "description": "Goal count per period" },
    "color": { "type": "string", "pattern": "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" },
    "archived": { "type": "boolean", "default": false },
    "created": { "type": "string", "format": "date-time" },
    "lastModified": { "type": "string", "format": "date-time" }
  }
}
```

#### Habit Log Schema
The log entity records the execution of a habit. To optimize for the heatmap visualization, logs are stored as a sparse array of events rather than a daily record of zeroes.
```json
{
  "type": "object",
  "properties": {
    "habitId": { "type": "string", "format": "uuid" },
    "date": { "type": "string", "format": "date", "description": "YYYY-MM-DD" },
    "value": { "type": "integer", "description": "The magnitude of the contribution" }
  }
}
```

### 2.3 The Phoenix Note Entity (The Keep Surrogate)
A critical limitation identified in the research is that the Google Keep API is restricted to Enterprise environments and not available to personal Gmail accounts. To satisfy the requirement for note integration without violating API access policies, Project Phoenix introduces the **"Phoenix Note."**

Phoenix Notes are JSON files stored in a user-designated `Phoenix_Notes` folder in Google Drive.

#### Phoenix Note Schema
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "description": "Google Drive File ID" },
    "title": { "type": "string" },
    "content": { "type": "string", "description": "HTML or Markdown content" },
    "labels": { "type": "array", "items": { "type": "string" } },
    "color": { "type": "string", "enum": ["DEFAULT", "RED", "ORANGE", "YELLOW", "GREEN", "TEAL", "BLUE", "PURPLE", "PINK", "BROWN", "GRAY"] },
    "attachments": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "fileId": { "type": "string" },
          "mimeType": { "type": "string" },
          "webViewLink": { "type": "string" }
        }
      }
    }
  }
}
```
This schema closely mimics the Google Keep data structure, allowing for a potential future migration if the API becomes public, while currently relying on the permissive `drive.file` scope.

### 2.4 The Focus Session Entity
Focus sessions track time-boxed work periods (Pomodoro technique). Sessions are stored alongside habits in Drive appdata as `focus-sessions.json`.

#### Focus Session Schema
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "taskId": { "type": "string", "nullable": true, "description": "Optional linked task ID" },
    "taskTitle": { "type": "string", "nullable": true, "description": "Snapshot of linked task title at session start" },
    "startTime": { "type": "string", "format": "date-time", "description": "ISO 8601 UTC" },
    "plannedDuration": { "type": "integer", "minimum": 1, "description": "Planned duration in minutes (default 25)" },
    "actualDuration": { "type": "integer", "minimum": 0, "description": "Actual elapsed time in minutes" },
    "completed": { "type": "boolean", "description": "Whether the full planned duration was completed" },
    "type": { "type": "string", "enum": ["WORK", "SHORT_BREAK", "LONG_BREAK"] }
  }
}
```

#### Focus Settings Schema
Stored in `focus-settings.json` in Drive appdata.
```json
{
  "type": "object",
  "properties": {
    "workDuration": { "type": "integer", "default": 25, "description": "Work period in minutes" },
    "shortBreakDuration": { "type": "integer", "default": 5, "description": "Short break in minutes" },
    "longBreakDuration": { "type": "integer", "default": 15, "description": "Long break in minutes" },
    "sessionsBeforeLongBreak": { "type": "integer", "default": 4, "description": "Work sessions before a long break" },
    "autoStartBreaks": { "type": "boolean", "default": false },
    "autoStartWork": { "type": "boolean", "default": false }
  }
}
```

---

## 3. External Integration Specification
Direct integration with Google Workspace APIs requires careful handling of authentication flows, quota management, and error handling.

### 3.1 Authentication and Security Architecture
The system employs **OAuth 2.0 with Proof Key for Code Exchange (PKCE)** for both Web and Android clients.

#### Scope Strategy
To maximize user trust and conversion, the application uses an **"Incremental Authorization"** strategy. Scopes are requested only when the specific feature is accessed.
*   **Baseline Scope**: `openid`, `email`, `profile`. Requested on login.
*   **Task Scope**: `https://www.googleapis.com/auth/tasks`. Requested when the user clicks the "Tasks" tab.
*   **Calendar Scope**: `https://www.googleapis.com/auth/calendar.events`. Requested when accessing the "Schedule" view.
*   **Drive Scope**: `https://www.googleapis.com/auth/drive.file` and `https://www.googleapis.com/auth/drive.appdata`. Requested for Notes and Backup configuration.

> **Agent Instruction:**
> Agents must implement an `AuthInterceptor` (Web) and `AuthAuthenticator` (Android/OkHttp) that detects 401 Unauthorized responses. Upon detection, the system must attempt to refresh the access token using the stored refresh token. If the refresh fails, the user must be redirected to the login screen.

### 3.2 Google Tasks Service Integration
The Google Tasks API is RESTful but contains specific nuances regarding list management and task positioning.

#### Service Interface (TypeScript/Kotlin)
*   `listTaskLists()`: Retrieving the user's lists is the first step.
*   `getTasks(listId, showCompleted=false)`: Fetches tasks. Pagination via `pageToken` is mandatory.
*   `moveTask(listId, taskId, parentId, previousId)`: Critical for "Drag and Drop" functionality. The API requires both `parentId` (for nesting) and `previousId` (for ordering).

#### Quota Management
Google Tasks has a quota on queries per minute. The `TaskService` must implement a **"Leaky Bucket"** rate limiter or simple exponential backoff. If a `429 Too Many Requests` is received, the system waits $2^n + \text{random\_jitter}$ seconds before retrying.

### 3.3 Google Calendar Integration
The Calendar integration focuses on the **"Day View"** to provide context for tasks.

#### Sync Strategy
*   **Initial Sync**: Fetch events for `timeMin=Now-30d` and `timeMax=Now+90d`. Store the `nextSyncToken`.
*   **Incremental Sync**: On subsequent loads, pass the stored `syncToken`. The API returns only modified events (new, updated, cancelled).

#### Data Mapping
*   Calendar events must be mapped to a readonly `PhoenixEvent` entity.
*   Google Event Color must be mapped to the Phoenix CSS/Material color palette.
*   HTML Description in events must be sanitized before rendering to prevent XSS.

### 3.4 Google Docs and Drive Integration
The integration with Google Docs is primarily **"Referential."** Project Phoenix acts as a launcher and organizer.

*   **Search**: Use the `q` parameter in the Drive API to filter by MIME type `application/vnd.google-apps.document`.
*   **Creation**: Use the `files.create` method.
*   **Linking**: When a user attaches a Doc to a Task, the app stores the `webViewLink` and `iconLink` in the task's metadata.

---

## 4. Web Application Specification (Angular 21+)
The web client is the flagship interface, utilizing the latest advancements in the Angular framework.

### 4.1 Macro-Architecture and Workspace Layout
The application is structured as a **"Modular Monolith"** within a standard Angular CLI workspace.

#### Directory Structure
```text
src/app/
├── core/       # Singleton services (Auth, HTTP, Logging)
├── data/       # Types, Interfaces, API Clients (The Data Layer)
├── state/      # SignalStores for global state
├── features/   # Feature-grouped components
│   ├── dashboard/
│   ├── tasks/
│   ├── calendar/
│   ├── habits/
│   └── notes/
└── shared/     # Reusable UI components (Buttons, Dialogs, Pipes)
```

### 4.2 State Management: The SignalStore Revolution
Project Phoenix eschews the traditional RxJS-heavy NgRx pattern in favor of **SignalStore** (part of `@ngrx/signals`).

> **Why SignalStore?**
> Signals provide fine-grained reactivity. When a single task's status changes, only the specific DOM node bound to that signal updates. This is critical for the performance of the Habit Heatmap (365+ cells).

#### Store Definition Example
```typescript
export const TasksStore = signalStore(
  { providedIn: 'root' },
  withState({ tasks: [], loading: false, filter: 'ALL' }),
  withComputed(({ tasks, filter }) => ({
    filteredTasks: computed(() => {
        return tasks().filter(t => filter() === 'ALL' || t.status === filter())
    }),
    completionRate: computed(() => {
        const total = tasks().length;
        const completed = tasks().filter(t => t.status === 'completed').length;
        return total > 0 ? (completed / total) * 100 : 0;
    })
  })),
  withMethods((store, taskService = inject(TaskService)) => ({
    async loadTasks() {
      patchState(store, { loading: true });
      const data = await taskService.getTasks();
      patchState(store, { tasks: data, loading: false });
    }
  }))
);
```

### 4.3 Component Design and Signals
Components must be **Standalone** and utilize the `OnPush` change detection strategy.

*   **Inputs as Signals**: Angular 21 introduces `input()` signals.
    *   *Legacy:* `@Input() data: Task;`
    *   *Phoenix Standard:* `data = input.required<Task>();`
*   **View Integration**: The Habit Heatmap component requires dynamic rendering.
    *   **Grid Layout**: Use CSS Grid with `grid-template-rows: repeat(7, 1fr)` and `grid-auto-flow: column`.
    *   **Cell Component**: A dumb component taking `level` (0-4) as an input signal.

### 4.4 Styling and Theming (Material 3)
The application uses **Angular Material 18+**, supporting **Material 3 Design Tokens**.
*   **Theming**: Define a custom theme using the `mat.define-theme()` mixin.
*   **Dark Mode**: Implement a `ThemeService` that toggles a class on the body element.

### 4.5 Dashboard: Unified Today View
The Dashboard is the application's landing page. It aggregates data from all feature stores into a single, actionable "Today" view.

#### Architecture
*   **DashboardStore**: A SignalStore that injects `TasksStore`, `CalendarStore`, `HabitsStore`, and `NotesStore`. It exposes computed signals that derive today-relevant data from each store.
*   **No dedicated service**: The Dashboard does not call APIs directly — it reads from existing stores that are already loaded.

#### Layout (Responsive Grid)
```text
┌─────────────────────────────────────────────┐
│  Good morning, {userName}!                  │
│  {date} · {tasksCompleted}/{totalTasks}     │
├──────────────────────┬──────────────────────┤
│  TODAY'S TASKS       │  TODAY'S SCHEDULE    │
│  ☐ Task 1 (overdue)  │  9:00 AM Meeting     │
│  ☐ Task 2 (due today)│  11:30 AM Lunch      │
│  ☑ Task 3 (done)     │  2:00 PM Workshop    │
│                      │                      │
├──────────────────────┼──────────────────────┤
│  HABITS TODAY        │  RECENT NOTES        │
│  ✓ Exercise (done)   │  📝 Project plan     │
│  ○ Meditate (pending)│  📝 Meeting notes    │
│  ○ Read (pending)    │                      │
└──────────────────────┴──────────────────────┘
```

#### Computed State
```typescript
// DashboardStore computed signals
todayTasks: Task[]         // Tasks due today or overdue (status = needsAction)
todayEvents: CalendarEvent[] // Events where start date = today, sorted by time
habitStatus: { habit: Habit; loggedToday: boolean; todayValue: number }[]
recentNotes: Note[]        // Last 4 notes by lastModified
greeting: string           // Time-of-day greeting ("Good morning/afternoon/evening")
completionSummary: { done: number; total: number; percentage: number }
```

#### Components
*   **`DashboardComponent`** (smart): Injects `DashboardStore`, triggers data loading on init.
*   **`TaskSummaryWidget`** (presentational): Displays today's tasks with inline toggle.
*   **`ScheduleTimelineWidget`** (presentational): Vertical timeline of today's events.
*   **`HabitStatusWidget`** (presentational): List of habits with today's completion status.
*   **`RecentNotesWidget`** (presentational): Compact note cards (last 4).
*   **`GreetingHeader`** (presentational): User greeting with date and summary stats.

### 4.6 Focus Timer (Pomodoro)
The Focus Timer provides a built-in Pomodoro timer that persists across page navigation.

#### Architecture
*   **FocusStore**: SignalStore managing the active timer state, session history, and settings.
*   **FocusService**: Reads/writes `focus-sessions.json` and `focus-settings.json` from Drive appdata (same pattern as `HabitService`).
*   **Global Timer**: The timer component lives in the **app toolbar** (not inside a feature route), so it persists across navigation.

#### State Shape
```typescript
interface FocusState {
  sessions: FocusSession[];       // Today's completed sessions
  settings: FocusSettings;        // Timer configuration
  loading: boolean;
  error: string | null;

  // Active timer state (not persisted — ephemeral)
  timerStatus: 'IDLE' | 'RUNNING' | 'PAUSED';
  timerType: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';
  remainingSeconds: number;       // Countdown remaining
  currentSessionStart: string | null; // ISO timestamp
  linkedTaskId: string | null;
  linkedTaskTitle: string | null;
  sessionsCompleted: number;      // Count in current cycle (resets after long break)
}
```

#### Timer Behavior
1.  User clicks **Start** → timer begins countdown from `settings.workDuration * 60`.
2.  Timer ticks every second, updating `remainingSeconds`.
3.  When `remainingSeconds === 0`:
    *   If `timerType === 'WORK'`: Save completed `FocusSession` to store. Increment `sessionsCompleted`. If `sessionsCompleted % sessionsBeforeLongBreak === 0`, switch to `LONG_BREAK`, else `SHORT_BREAK`.
    *   If break: Switch to `WORK`.
4.  User can **Pause** / **Resume** / **Stop** at any time.
5.  **Stop** saves a partial session (`completed: false`, `actualDuration` = elapsed).

#### Components
*   **`FocusTimerComponent`** (toolbar): Compact timer display (MM:SS + play/pause/stop). Expands to show task link and settings.
*   **`FocusSettingsDialogComponent`**: Material dialog for configuring durations.
*   **`FocusHistoryComponent`**: List of today's completed sessions (shown on dashboard or dedicated route).
*   **`TaskLinkSelectorComponent`**: Autocomplete to search and link a task to the current session.

#### Timer Implementation
> **Agent Instruction**: Use `setInterval` for the countdown. Store the interval ID in the store. Clean up on stop/destroy. Do NOT use RxJS timer — keep it simple with `window.setInterval` and `window.clearInterval`.

### 4.7 Weekly Review / Productivity Insights
The Insights page provides analytics and trends to motivate continued use.

#### Architecture
*   **InsightsStore**: SignalStore that computes analytics from `TasksStore`, `HabitsStore`, `CalendarStore`, and `FocusStore`.
*   **Read-only**: No API calls — purely computed from existing store data.
*   **Date range**: Last 28 days (4 weeks) by default.

#### Computed Analytics
```typescript
interface InsightsData {
  // Task analytics
  taskCompletionByDay: { date: string; completed: number; created: number }[];
  totalTasksCompleted: number;
  averageTasksPerDay: number;

  // Habit analytics
  habitStreaks: { habit: Habit; currentStreak: number; longestStreak: number; consistency: number }[];
  overallHabitConsistency: number; // percentage

  // Calendar analytics
  eventsByDay: { date: string; count: number; totalMinutes: number }[];
  busiestDay: string;
  averageEventsPerDay: number;

  // Focus analytics
  focusByDay: { date: string; sessions: number; totalMinutes: number }[];
  totalFocusMinutes: number;
  averageFocusPerDay: number;

  // Weekly summary
  weekSummary: {
    tasksCompleted: number;
    habitsLogged: number;
    focusMinutes: number;
    eventsAttended: number;
    productivityScore: number; // 0-100 composite
  };
}
```

#### Productivity Score Formula
```
score = (taskWeight * taskRatio + habitWeight * habitConsistency + focusWeight * focusRatio) * 100

where:
  taskRatio = min(1, completedTasks / max(1, targetTasksPerWeek))
  targetTasksPerWeek = average tasks created per week (adaptive)
  habitConsistency = overallHabitConsistency / 100
  focusRatio = min(1, totalFocusMinutes / targetFocusMinutes)
  targetFocusMinutes = 5 * workDuration (5 sessions/day * 5 workdays)

  taskWeight = 0.4
  habitWeight = 0.35
  focusWeight = 0.25
```

#### Layout
```text
┌─────────────────────────────────────────────┐
│  WEEKLY REVIEW · Feb 10 – Feb 16            │
│  Productivity Score: 78/100 ██████████░░    │
├──────────────────────┬──────────────────────┤
│  TASKS COMPLETED     │  FOCUS TIME          │
│  ▁▂▃▅▇█▅▃ (28 days) │  ▁▂▃▅▇█▅▃ (28 days) │
│  42 tasks this week  │  12h 30m this week   │
│  avg 6/day           │  avg 2.5h/day        │
├──────────────────────┼──────────────────────┤
│  HABIT STREAKS       │  SCHEDULE DENSITY    │
│  🔥 Exercise: 14 days│  Mon ████████ 6 evts │
│  🔥 Read: 7 days     │  Tue ██████ 4 evts   │
│  ○ Meditate: 0 days  │  Wed ████ 3 evts     │
└──────────────────────┴──────────────────────┘
```

#### Components
*   **`InsightsComponent`** (smart): Injects `InsightsStore`, triggers data computation.
*   **`ScoreCardComponent`** (presentational): Large productivity score display with progress arc.
*   **`TrendChartComponent`** (presentational): Simple bar chart rendered with CSS (no charting library). Takes `data: { label: string; value: number }[]` as input.
*   **`HabitStreaksWidget`** (presentational): Streak display per habit.
*   **`WeeklySummaryCard`** (presentational): Compact summary of the week's metrics.

> **Agent Instruction for Charts**: Implement charts as pure CSS bar charts using Tailwind utility classes (`h-[N%]`, flexbox columns). Do NOT add a charting library (e.g., Chart.js, D3). Keep bundle size minimal.

---

## 5. Native Android Specification (Transposition Strategy)
The Android client mirrors the Web client's functionality using native mobile paradigms.

### 5.1 Architecture: Offline-First MVVM
The Android app must be fully functional offline.
*   **UI Layer**: Jetpack Compose.
*   **Presentation Layer**: ViewModels holding `StateFlows`.
*   **Data Layer**: Repository pattern with Room (Local) and Retrofit (Remote).

### 5.2 Mapping Angular Concepts to Jetpack Compose

| Angular Concept | Android/Kotlin Equivalent | Implementation Notes |
| :--- | :--- | :--- |
| Component | Composable Function | `@Composable fun TaskList(...)` |
| Template (HTML) | Compose UI Tree | `Column { Text(...) }` |
| Signal / `@Input` | `State` / Parameter | `val tasks by viewModel.tasks.collectAsState()` |
| Service | Repository | Singleton managed by Hilt (DI). |
| Directive (`@if`, `@for`) | Control Flow | `if (...) { }`, `items(...) { }` |
| Pipe | Extension Function | `fun Date.toRelativeString(): String` |
| Dependency Injection | Hilt / Dagger | `@Inject constructor(...)` |
| Lifecycle (`ngOnInit`) | `LaunchedEffect` | `LaunchedEffect(Unit) { viewModel.load() }` |

### 5.3 Local Persistence: Room Database
The database schema must mirror the JSON schema but utilize SQL relational integrity.

```kotlin
@Entity(tableName = "tasks")
data class TaskEntity(
    @PrimaryKey val id: String,
    val title: String,
    val isCompleted: Boolean,
    val dueDate: Long?,
    val isDirty: Boolean = false, // Critical for sync
    val isDeleted: Boolean = false // Soft delete
)
```
> **Agent Instruction:** Create a `TypeConverter` for storing the meta JSON object as a String in the SQLite database, and parse it back to a Data Class upon reading.

### 5.4 Synchronization Engine (WorkManager)
Synchronization on Android is handled by **WorkManager**, guaranteeing execution even if the app is closed.

**Sync Strategy (The "Delta" Approach):**
1.  **Pull**: Fetch all tasks from Google API modified after `last_sync_timestamp`.
2.  **Merge**:
    *   If `Remote.updated > Local.updated`: Overwrite local.
    *   If `Local.updated > Remote.updated` AND `Local.isDirty`: Conflict (Strategy: Server Wins for MVP).
3.  **Push**: Query Room for `isDirty == true`. POST/PATCH these tasks to Google API.

### 5.5 UI Implementation details
*   **Navigation**: Use `androidx.navigation.compose` with type-safe routes.
*   **Habit Heatmap**: Use a **Canvas** for high-performance drawing.
    > **Agent Instruction:** Implement a Canvas composable. Calculate the x/y coordinates for each square based on `(WeekIndex * Size)` and `(DayIndex * Size)`. Use `drawRect` for rendering.

---

## 6. The Habit Tracker Heatmap Algorithm
The contribution graph logic is shared conceptually but implemented natively on each platform.

### 6.1 Mathematical Logic
The heatmap represents a rolling window of 52 weeks (approx. 365 days).
*   **Normalization**: Determine the `MaxValue` in the dataset to establish the color scale ceiling.
*   **Scale (4 Quartiles)**:
    *   Level 0: 0
    *   Level 1: 1 to $0.25 \times Max$
    *   Level 2: $0.25 \times Max$ to $0.50 \times Max$
    *   Level 3: $0.50 \times Max$ to $0.75 \times Max$
    *   Level 4: $> 0.75 \times Max$
*   **Grid Positioning**:
    *   `WeekIndex = Floor(DayDifference / 7)`
    *   `DayIndex = DayDifference % 7` (Where `DayDifference` is days since `StartDate`).

---

## 7. Agentic Skills and Instructions
This section defines the specific capabilities (Skills) that the AI agents must instantiate.

### 7.1 Skill: API Schema Ingestion and Typing
*   **Capability**: Ingest `discovery.json` from Google APIs and auto-generate TypeScript Interfaces and Kotlin Data Classes.
*   **Instruction**: "Analyze the provided JSON response sample. Generate a strictly typed interface. Ensure optional fields are marked with `?` or `Nullable`. Do not use `any` or `Object`."

### 7.2 Skill: The "Transpose" Pattern (Angular to Compose)
*   **Capability**: Translate Angular HTML/CSS to Jetpack Compose modifier chains.
*   **Instruction**: "Read the CSS class `.task-card { padding: 16px; border-radius: 8px; background: white; }`. Generate a Kotlin Modifier: `Modifier.padding(16.dp).clip(RoundedCornerShape(8.dp)).background(Color.White)`."

### 7.3 Skill: Defensive Coding for Quotas
*   **Capability**: Implementing retry logic with exponential backoff.
*   **Instruction**: "Wrap all HTTP calls in a `retryWhen` (RxJS) or `retry` (Kotlin Flow) block. Detect 429 status codes. Implement a binary exponential backoff delay strategy."

### 7.4 Skill: Documentation-Driven Development (DDD)
*   **Capability**: Generating Mermaid.js diagrams before writing code.
*   **Instruction**: "Before implementing the SyncWorker, generate a Mermaid Sequence Diagram showing the interaction between the Local Database, the WorkManager, and the Remote API."

---

## 8. Conclusion and Implementation Roadmap
Project Phoenix balances performance, privacy, and capability by leveraging **Angular 21 (Signals)** and **Android Native (Room, Compose)**. This document acts as the immutable Single Source of Truth for the construction of this ecosystem.

### Citations and References
1.  **Google Keep API Limitations**: Research regarding restricted access for personal accounts.
2.  **OAuth 2.0 Standards**: PKCE implementation for public clients.
3.  **Google Calendar API Sync Tokens**: Official documentation for efficient incremental sync.
4.  **Heatmap Visualization Logic**: Contribution graph plotting algorithms.
5.  **Angular Signals and State Management**: Angular v21 reactive primitives.
6.  **Jetpack Compose and Material 3**: Android UI development standards.
7.  **Offline-First Architecture**: Best practices for mobile data synchronization.
8.  **Google Drive App Data Folder**: Usage of hidden storage for configuration.
9.  **Google Tasks API Structure**: Hierarchy of TaskLists and Task items.
