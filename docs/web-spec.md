# Web Application Specification — Angular 21+

> Distilled from `design.md` §4. Refer to `design.md` for full context.

---

## Architecture: Modular Monolith

The Angular app is a standard CLI workspace organized as a modular monolith.

### Directory Structure

```
src/app/
├── core/       # Singleton services (Auth, HTTP interceptors, Logging)
├── data/       # Types, Interfaces, API Clients (the data layer)
├── state/      # SignalStores for global state
├── features/   # Feature-grouped components
│   ├── dashboard/
│   ├── tasks/
│   ├── calendar/
│   ├── habits/
│   └── notes/
└── shared/     # Reusable UI components (Buttons, Dialogs, Pipes)
```

### Layer Responsibilities

| Layer | Contains | Rules |
|-------|----------|-------|
| `core/` | `AuthService`, `AuthInterceptor`, `LoggingService` | Singleton — provided in root. No UI. |
| `data/` | TypeScript interfaces, API client services | Pure data. No state, no UI. |
| `state/` | SignalStore definitions | Global state only. Feature-local state lives in feature modules. |
| `features/` | Smart + dumb components per feature | Each feature folder is self-contained. |
| `shared/` | Reusable presentational components, pipes, directives | No business logic. No API calls. |

---

## State Management: SignalStore

Use `@ngrx/signals` SignalStore — not traditional NgRx with actions/reducers/effects.

### Why SignalStore

- Fine-grained reactivity: only the DOM nodes bound to changed signals re-render
- Critical for heatmap performance (365+ cells)
- No zone.js dependency (Angular 21+ zoneless mode)

### Store Definition Pattern

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

### Pattern Rules

- Use `withState` for initial state shape
- Use `withComputed` for derived signals
- Use `withMethods` for async operations and state mutations
- Inject services via `inject()` inside `withMethods`
- Use `patchState` — never mutate state directly

---

## Component Conventions

### All Components Must Be

1. **Standalone** — `standalone: true` (no NgModules)
2. **OnPush** — `changeDetection: ChangeDetectionStrategy.OnPush`
3. **Signal-based inputs** — use `input()` / `input.required<T>()`

### Input Patterns

```typescript
// DO: Signal-based input (Phoenix standard)
data = input.required<Task>();

// DON'T: Legacy decorator input
@Input() data: Task;
```

### Component Structure

```typescript
@Component({
  selector: 'app-task-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatCheckboxModule],
  template: `...`,
})
export class TaskCardComponent {
  task = input.required<Task>();
  onToggle = output<string>();
}
```

---

## Styling & Theming: Material 3

### Setup

- Use **Angular Material 18+** with Material 3 Design Tokens
- Define a custom theme using the `mat.define-theme()` mixin

### Dark Mode

- Implement a `ThemeService` that toggles a CSS class on `<body>`
- Persist the user's preference in `localStorage`
- Respect `prefers-color-scheme` media query as default

---

## Habit Heatmap (Web Implementation)

### Grid Layout

```css
.heatmap-grid {
  display: grid;
  grid-template-rows: repeat(7, 1fr);
  grid-auto-flow: column;
  gap: 2px;
}
```

### Cell Component

- Dumb component accepting `level` (0–4) as an input signal
- CSS maps level to background color (4 intensity levels + empty)
- Use `OnPush` change detection for 365+ cell performance

---

## Testing

See `docs/testing-spec.md` for the full testing strategy. Key points:

- **TDD**: Write `.spec.ts` files before implementation
- **Runner**: Karma + Jasmine (`ng new --test-runner=karma`)
- **Zoneless**: Use `await fixture.whenStable()`, not `fixture.detectChanges()`
- **Signal inputs**: Set via `fixture.componentRef.setInput()`
- **No zone.js utilities**: Use `jasmine.clock()` instead of `fakeAsync`/`tick`
- **HTTP**: Use `provideHttpClient()` + `provideHttpClientTesting()`

Use `/unit-test-writer` to generate specs following all conventions.

---

## Agent Checklist: Before Committing Angular Code

- [ ] Component is `standalone: true`
- [ ] Component uses `ChangeDetectionStrategy.OnPush`
- [ ] Inputs use `input()` / `input.required<T>()` — not `@Input()`
- [ ] State mutations go through `patchState()` on a SignalStore
- [ ] No `zone.js` imports — app runs in zoneless mode
- [ ] No `any` types — all data is strictly typed
- [ ] Feature components live under `features/<feature-name>/`
- [ ] Shared components live under `shared/`
- [ ] Services in `core/` are `providedIn: 'root'`
- [ ] API client services live in `data/`
