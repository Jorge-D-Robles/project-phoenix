# Testing Strategy — Angular 21+ with Karma & Jasmine

> Project Phoenix follows **Test-Driven Development (TDD)**. Write specs first, then implement.

---

## Philosophy: TDD Red-Green-Refactor

1. **Red**: Write a failing `.spec.ts` describing the desired behavior
2. **Green**: Write the minimum implementation to make the spec pass
3. **Refactor**: Clean up implementation without breaking any specs
4. Repeat for each unit of behavior

Every service, store, component, interceptor, and utility must have a co-located `.spec.ts` file **before** implementation begins.

---

## Test Runner: Karma + Jasmine

Angular 21 defaults to Vitest, but Phoenix uses Karma + Jasmine for browser-based testing.

### Project Scaffold

When creating the Angular project, specify Karma:

```bash
ng new phoenix-web --test-runner=karma
```

### angular.json Configuration

```json
{
  "architect": {
    "test": {
      "builder": "@angular/build:unit-test",
      "options": {
        "runner": "karma"
      }
    }
  }
}
```

### Required Packages

```bash
npm install --save-dev \
  karma \
  karma-chrome-launcher \
  karma-coverage \
  karma-jasmine \
  karma-jasmine-html-reporter \
  jasmine-core \
  @types/jasmine
```

### CI Command

```bash
ng test --no-watch --no-progress --browsers=ChromeHeadless
```

---

## Zoneless Testing

Angular 21 runs zoneless by default — no `zone.js`. This changes testing fundamentals.

### Change Detection in Tests

- **Prefer** `await fixture.whenStable()` — lets Angular decide when to sync (production-like)
- `fixture.detectChanges()` still works but forces synchronous change detection (less realistic)
- Never import `zone.js` or `zone.js/testing`

```typescript
// DO: Production-like async detection
it('should render title', async () => {
  const fixture = TestBed.createComponent(MyComponent);
  await fixture.whenStable();
  expect(fixture.nativeElement.textContent).toContain('expected');
});

// DON'T: Force synchronous detection
it('should render title', () => {
  const fixture = TestBed.createComponent(MyComponent);
  fixture.detectChanges(); // less production-like
  expect(fixture.nativeElement.textContent).toContain('expected');
});
```

### Timer Mocking (No `fakeAsync` / `tick`)

`fakeAsync()` and `tick()` require zone.js. Use Jasmine's native clock:

```typescript
it('should debounce search', () => {
  jasmine.clock().install();

  component.onSearch('query');
  jasmine.clock().tick(300);
  expect(mockService.search).toHaveBeenCalledWith('query');

  jasmine.clock().uninstall();
});
```

### Flushing Effects

Use `TestBed.tick()` to flush effects (replaces deprecated `TestBed.flushEffects()`):

```typescript
it('should sync via effect', () => {
  service.updateValue('new');
  TestBed.tick(); // triggers change detection + root/component effects
  expect(spy).toHaveBeenCalled();
});
```

---

## File Organization & Naming

### Co-location Rule

Test files live **next to** the source file they test. Never collect tests in a separate `tests/` directory.

### Naming Convention

| Source | Test |
|--------|------|
| `auth.service.ts` | `auth.service.spec.ts` |
| `task-card.component.ts` | `task-card.component.spec.ts` |
| `tasks.store.ts` | `tasks.store.spec.ts` |
| `task.parser.ts` | `task.parser.spec.ts` |
| `auth.interceptor.ts` | `auth.interceptor.spec.ts` |

### Directory Example

```
src/app/
├── core/
│   ├── auth.service.ts
│   ├── auth.service.spec.ts
│   ├── auth.interceptor.ts
│   └── auth.interceptor.spec.ts
├── data/
│   ├── task.service.ts
│   ├── task.service.spec.ts
│   ├── task.parser.ts
│   └── task.parser.spec.ts
├── state/
│   ├── tasks.store.ts
│   └── tasks.store.spec.ts
├── features/
│   └── tasks/
│       ├── task-list.component.ts
│       ├── task-list.component.spec.ts
│       ├── task-card.component.ts
│       └── task-card.component.spec.ts
└── shared/
    ├── confirm-dialog.component.ts
    └── confirm-dialog.component.spec.ts
```

---

## Spec Organization Pattern

### Describe/It Structure

```typescript
describe('TaskCardComponent', () => {
  let fixture: ComponentFixture<TaskCardComponent>;
  let component: TaskCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCardComponent);
    component = fixture.componentInstance;
  });

  describe('rendering', () => {
    it('should display task title', async () => { /* ... */ });
    it('should show completed state when task is done', async () => { /* ... */ });
  });

  describe('interactions', () => {
    it('should emit onToggle when checkbox clicked', () => { /* ... */ });
  });

  describe('edge cases', () => {
    it('should handle missing due date gracefully', async () => { /* ... */ });
  });
});
```

### Rules

- Group `it` blocks by behavior category using nested `describe`
- Use descriptive `it` strings that read as sentences
- One logical assertion per `it` block (multiple `expect` OK if testing one behavior)
- Use `beforeEach` for shared setup; avoid `beforeAll` for component tests
- Use `afterEach` with `httpTesting.verify()` for HTTP tests
- Avoid test interdependence — each `it` must be independently runnable

---

## Testing Patterns by Layer

### Component Testing (Signal Inputs/Outputs)

**Setting signal inputs via `componentRef.setInput()`:**

```typescript
it('should display task title', async () => {
  const fixture = TestBed.createComponent(TaskCardComponent);

  fixture.componentRef.setInput('task', {
    id: '1', title: 'Test Task', status: 'needsAction'
  });
  await fixture.whenStable();

  const el = fixture.debugElement.query(By.css('.task-title'));
  expect(el.nativeElement.textContent).toContain('Test Task');
});
```

**Testing outputs:**

```typescript
it('should emit on toggle', async () => {
  const fixture = TestBed.createComponent(TaskCardComponent);
  fixture.componentRef.setInput('task', testTask);
  await fixture.whenStable();

  let emittedId: string | undefined;
  fixture.componentInstance.onToggle.subscribe((id: string) => {
    emittedId = id;
  });

  fixture.debugElement.query(By.css('mat-checkbox')).nativeElement.click();
  expect(emittedId).toBe(testTask.id);
});
```

**Host component pattern (for complex two-way bindings):**

```typescript
@Component({
  template: `<app-task-card [task]="task" (onToggle)="toggled = $event" />`,
  standalone: true,
  imports: [TaskCardComponent],
})
class TestHostComponent {
  task: Task = { id: '1', title: 'Test', status: 'needsAction' };
  toggled: string | null = null;
}

it('should propagate toggle to parent', async () => {
  const fixture = TestBed.createComponent(TestHostComponent);
  await fixture.whenStable();

  fixture.debugElement.query(By.css('mat-checkbox')).nativeElement.click();
  expect(fixture.componentInstance.toggled).toBe('1');
});
```

### SignalStore Testing

**Direct store testing:**

```typescript
describe('TasksStore', () => {
  let store: InstanceType<typeof TasksStore>;
  let mockTaskService: jasmine.SpyObj<TaskService>;

  beforeEach(() => {
    mockTaskService = jasmine.createSpyObj('TaskService', ['getTasks']);
    mockTaskService.getTasks.and.resolveTo([
      { id: '1', title: 'Task A', status: 'needsAction' },
      { id: '2', title: 'Task B', status: 'completed' },
    ]);

    TestBed.configureTestingModule({
      providers: [
        TasksStore,
        { provide: TaskService, useValue: mockTaskService },
      ],
    });

    store = TestBed.inject(TasksStore);
  });

  it('should have empty initial state', () => {
    expect(store.tasks()).toEqual([]);
    expect(store.loading()).toBe(false);
  });

  it('should load tasks from service', async () => {
    await store.loadTasks();
    expect(store.tasks().length).toBe(2);
    expect(store.loading()).toBe(false);
  });

  it('should compute completion rate', async () => {
    await store.loadTasks();
    expect(store.completionRate()).toBe(50);
  });

  it('should filter tasks by status', async () => {
    await store.loadTasks();
    patchState(store, { filter: 'completed' });
    expect(store.filteredTasks().length).toBe(1);
  });
});
```

**Mocking a store for component tests:**

```typescript
const mockStore = jasmine.createSpyObj('TasksStore', ['loadTasks'], {
  tasks: signal([testTask]),
  loading: signal(false),
  filteredTasks: signal([testTask]),
  completionRate: signal(100),
});

TestBed.configureTestingModule({
  imports: [TaskListComponent],
  providers: [{ provide: TasksStore, useValue: mockStore }],
});
```

### HTTP / Service Testing

```typescript
describe('TaskService', () => {
  let service: TaskService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TaskService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(TaskService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify(); // no outstanding requests
  });

  it('should fetch tasks for a list', () => {
    const mockTasks = [{ id: '1', title: 'Task' }];

    service.getTasks('listId').subscribe(tasks => {
      expect(tasks).toEqual(mockTasks);
    });

    const req = httpTesting.expectOne(
      'https://tasks.googleapis.com/tasks/v1/lists/listId/tasks'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ items: mockTasks });
  });

  it('should handle 429 with retry', () => {
    service.getTasks('listId').subscribe();

    const req = httpTesting.expectOne(r => r.url.includes('listId'));
    req.flush('Too Many Requests', { status: 429, statusText: 'Too Many Requests' });

    // Expect retry after backoff
    const retryReq = httpTesting.expectOne(r => r.url.includes('listId'));
    retryReq.flush({ items: [] });
  });
});
```

**Critical**: `provideHttpClient()` must come **before** `provideHttpClientTesting()`. Do not use the deprecated `HttpClientTestingModule`.

### Interceptor Testing

```typescript
describe('authInterceptor', () => {
  let httpTesting: HttpTestingController;
  let httpClient: HttpClient;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService',
      ['getToken', 'refreshToken', 'logout']
    );
    mockAuthService.getToken.and.returnValue('test-token');

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpTesting = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => httpTesting.verify());

  it('should attach Bearer token to requests', () => {
    httpClient.get('/api/data').subscribe();
    const req = httpTesting.expectOne('/api/data');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush({});
  });

  it('should call logout on 401 response', () => {
    httpClient.get('/api/data').subscribe({ error: () => {} });
    const req = httpTesting.expectOne('/api/data');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('should skip token when not authenticated', () => {
    mockAuthService.getToken.and.returnValue(null);
    httpClient.get('/api/public').subscribe();
    const req = httpTesting.expectOne('/api/public');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});
```

### Utility / Pure Function Testing

No TestBed needed — test functions directly:

```typescript
describe('TaskParser', () => {
  it('should extract meta from notes with delimiter', () => {
    const notes = 'User notes\n---PHOENIX_META---\n{"tags":["work"]}';
    const result = TaskParser.parse(notes);
    expect(result.userNotes).toBe('User notes');
    expect(result.meta).toEqual({ tags: ['work'] });
  });

  it('should return null meta when no delimiter present', () => {
    const result = TaskParser.parse('Plain notes');
    expect(result.userNotes).toBe('Plain notes');
    expect(result.meta).toBeNull();
  });

  it('should handle null notes input', () => {
    const result = TaskParser.parse(null);
    expect(result.userNotes).toBe('');
    expect(result.meta).toBeNull();
  });

  it('should serialize meta back into notes field', () => {
    const result = TaskParser.serialize('User notes', { tags: ['work'] });
    expect(result).toBe('User notes\n---PHOENIX_META---\n{"tags":["work"]}');
  });

  it('should omit delimiter when meta is null', () => {
    const result = TaskParser.serialize('User notes', null);
    expect(result).toBe('User notes');
  });
});
```

### Heatmap Algorithm Testing

```typescript
describe('getLevel', () => {
  it('should return 0 for zero value', () => {
    expect(getLevel(0, 100)).toBe(0);
  });

  it('should return 0 when maxValue is 0', () => {
    expect(getLevel(5, 0)).toBe(0);
  });

  it('should return 1 for values <= 25% of max', () => {
    expect(getLevel(25, 100)).toBe(1);
  });

  it('should return 2 for values <= 50% of max', () => {
    expect(getLevel(50, 100)).toBe(2);
  });

  it('should return 3 for values <= 75% of max', () => {
    expect(getLevel(75, 100)).toBe(3);
  });

  it('should return 4 for values > 75% of max', () => {
    expect(getLevel(76, 100)).toBe(4);
  });
});
```

---

## Coverage Targets

| Layer | Minimum Coverage |
|-------|-----------------|
| Utilities / Parsers | 100% |
| Interceptors | 100% |
| Services (data layer) | 90%+ |
| SignalStores | 90%+ |
| Components (smart) | 80%+ |
| Components (dumb/presentational) | 70%+ |

Run coverage report:

```bash
ng test --no-watch --code-coverage
```

---

## What NOT to Test

- Angular framework internals (don't test that `@Component` decorator works)
- Third-party library behavior (Material components, ngrx internals)
- Private methods directly — test them through public API
- CSS styling — visual regression is out of scope for unit tests

---

## Agent Checklist

- [ ] `.spec.ts` file exists **before** the implementation file (TDD)
- [ ] Specs written first, then implementation (Red → Green → Refactor)
- [ ] Test file co-located next to source file
- [ ] Uses `await fixture.whenStable()` — not `fixture.detectChanges()`
- [ ] No `fakeAsync` / `tick` — uses `jasmine.clock()` for timers
- [ ] Uses `TestBed.tick()` for effects — not deprecated `TestBed.flushEffects()`
- [ ] Signal inputs set via `fixture.componentRef.setInput()`
- [ ] Services mocked with `jasmine.createSpyObj()`
- [ ] HTTP tests use `provideHttpClient()` + `provideHttpClientTesting()` (not `HttpClientTestingModule`)
- [ ] `provideHttpClient()` listed **before** `provideHttpClientTesting()` in providers
- [ ] `httpTesting.verify()` called in `afterEach` for all HTTP test suites
- [ ] All `describe`/`it` blocks have descriptive names
- [ ] No `any` types in test code — strict typing everywhere
- [ ] `ng test` passes before committing
