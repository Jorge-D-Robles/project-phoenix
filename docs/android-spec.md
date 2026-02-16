# Android Specification — Kotlin / Jetpack Compose

> Distilled from `design.md` §5. Refer to `design.md` for full context.

---

## Architecture: Offline-First MVVM

The Android app must be fully functional offline. Room is the UI's single source of truth.

```
UI (Compose) → ViewModel (StateFlow) → Repository → Room (local) + Retrofit (remote)
```

### Layer Responsibilities

| Layer | Technology | Role |
|-------|-----------|------|
| UI | Jetpack Compose | Declarative UI — observes ViewModel state |
| Presentation | ViewModel + StateFlow | Holds UI state, exposes it as `StateFlow` |
| Data | Repository pattern | Orchestrates Room (local) and Retrofit (remote) |
| Local | Room (SQLite) | Single source of truth for UI rendering |
| Remote | Retrofit + OkHttp | Google API communication |
| DI | Hilt / Dagger | Dependency injection for all layers |
| Background | WorkManager | Guaranteed sync even when app is closed |

---

## Angular-to-Compose Mapping

Use this table when transposing Web features to Android:

| Angular Concept | Android/Kotlin Equivalent | Implementation Notes |
|----------------|--------------------------|---------------------|
| Component | Composable Function | `@Composable fun TaskList(...)` |
| Template (HTML) | Compose UI Tree | `Column { Text(...) }` |
| Signal / `@Input` | `State` / Parameter | `val tasks by viewModel.tasks.collectAsState()` |
| Service | Repository | Singleton managed by Hilt |
| Directive (`@if`, `@for`) | Control Flow | `if (...) { }`, `items(...) { }` |
| Pipe | Extension Function | `fun Date.toRelativeString(): String` |
| Dependency Injection | Hilt / Dagger | `@Inject constructor(...)` |
| Lifecycle (`ngOnInit`) | `LaunchedEffect` | `LaunchedEffect(Unit) { viewModel.load() }` |
| `HttpInterceptor` | OkHttp `Interceptor` / `Authenticator` | Auth token injection + 401 handling |
| SignalStore | ViewModel + StateFlow | `private val _state = MutableStateFlow(...)` |

---

## Room Entity Definitions

### TaskEntity

```kotlin
@Entity(tableName = "tasks")
data class TaskEntity(
    @PrimaryKey val id: String,
    val title: String,
    val isCompleted: Boolean,
    val dueDate: Long?,
    val isDirty: Boolean = false,
    val isDeleted: Boolean = false
)
```

### TypeConverter Instructions

Implement a `TypeConverter` for the meta JSON field:

1. Create a `Converters` class annotated with `@TypeConverters`
2. Convert `TaskMeta` → `String` (JSON serialization via Moshi or Kotlinx Serialization)
3. Convert `String` → `TaskMeta` (JSON deserialization)
4. Register the converter on the Room `@Database` class

```kotlin
class Converters {
    @TypeConverter
    fun fromMeta(meta: TaskMeta?): String? = meta?.let { Json.encodeToString(it) }

    @TypeConverter
    fun toMeta(json: String?): TaskMeta? = json?.let { Json.decodeFromString(it) }
}
```

---

## Synchronization Engine: WorkManager

### The Delta Approach

```
1. PULL   → Fetch tasks from Google API modified after last_sync_timestamp
2. MERGE  → Compare remote vs local:
             • Remote.updated > Local.updated → overwrite local
             • Local.updated > Remote.updated AND Local.isDirty → conflict
               (Strategy: Server Wins for MVP)
3. PUSH   → Query Room for isDirty == true → POST/PATCH to Google API
4. CLEAN  → Clear isDirty flags on successfully pushed items
```

### WorkManager Setup

- Use `PeriodicWorkRequest` for background sync (minimum 15-minute interval)
- Use `OneTimeWorkRequest` for immediate sync (triggered by user action)
- Chain: Pull → Merge → Push (sequential)
- Set constraints: `NetworkType.CONNECTED`
- Handle `Result.retry()` for transient failures

---

## Navigation

- Use `androidx.navigation.compose` with type-safe routes
- Define a sealed class/interface for route definitions
- Use `NavHost` at the top level with feature-level composable destinations

---

## Habit Heatmap: Canvas Implementation

Implement using a Compose `Canvas` for high-performance rendering:

```kotlin
Canvas(modifier = Modifier.fillMaxWidth().height(cellSize * 7 + gap * 6)) {
    habitLogs.forEach { log ->
        val weekIndex = daysBetween(startDate, log.date) / 7
        val dayIndex = daysBetween(startDate, log.date) % 7
        val x = weekIndex * (cellSize + gap)
        val y = dayIndex * (cellSize + gap)
        drawRect(
            color = levelToColor(log.level),
            topLeft = Offset(x, y),
            size = Size(cellSize, cellSize)
        )
    }
}
```

### Rules

- Calculate position: `x = WeekIndex * (cellSize + gap)`, `y = DayIndex * (cellSize + gap)`
- Use `drawRect` for each cell
- Map contribution level (0–4) to color intensity
- See `heatmap-algorithm.md` for quartile calculation

---

## Agent Checklist

- [ ] All Composables are stateless — state lives in ViewModel
- [ ] ViewModel exposes `StateFlow`, UI collects with `collectAsState()`
- [ ] Room is the single source of truth — UI never reads directly from network
- [ ] `isDirty` flag set on all local mutations (for sync)
- [ ] `isDeleted` used for soft deletes (sync before purge)
- [ ] TypeConverter registered for all non-primitive Room fields
- [ ] Hilt `@Inject constructor` on all repositories and ViewModels
- [ ] WorkManager sync handles network unavailability gracefully
- [ ] Navigation uses type-safe routes
- [ ] Canvas heatmap uses `drawRect` with calculated positions
