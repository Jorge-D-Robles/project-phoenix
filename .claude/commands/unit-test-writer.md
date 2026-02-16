Write unit tests for a Phoenix feature following TDD conventions.

## Instructions

1. **Read the testing spec**: Read `docs/testing-spec.md` for all conventions and patterns
2. **Read the feature spec**: Read the relevant `docs/` file to understand expected behavior:
   - Tasks → `docs/domain-models.md`, `docs/google-api-spec.md`
   - Calendar → `docs/google-api-spec.md`
   - Habits → `docs/domain-models.md`, `docs/heatmap-algorithm.md`
   - Notes → `docs/domain-models.md`, `docs/google-api-spec.md`
   - Auth → `docs/google-api-spec.md`
   - All → `docs/web-spec.md` for component conventions
3. **Read the source** (if it exists): If the implementation already exists, read it to understand the API surface. If it doesn't exist yet, that's expected — TDD means specs come first.
4. **Write the spec file**:
   - Create `<filename>.spec.ts` co-located next to the source file (or where it will live)
   - Follow the `describe`/`it` organization pattern from `docs/testing-spec.md`
   - Cover: happy path, edge cases (null, empty, boundary values), error handling
   - Use the correct testing pattern for the layer:
     - **Components** → `componentRef.setInput()` + `await fixture.whenStable()`
     - **Stores** → `TestBed.inject(Store)` + mock services with `jasmine.createSpyObj()`
     - **Services** → `provideHttpClient()` + `provideHttpClientTesting()`
     - **Interceptors** → `provideHttpClient(withInterceptors([...]))` + `provideHttpClientTesting()`
     - **Utilities** → Direct function calls, no TestBed needed
5. **Verify**: Run `ng test` to confirm specs compile and execute
   - If implementation doesn't exist yet: specs should **fail** (Red phase — this is correct TDD)
   - If implementation exists: specs should **pass** (Green phase)
6. **Report**: List all specs written and their expected pass/fail status

## Key Rules

- No `fakeAsync` / `tick` — use `jasmine.clock()` for timer mocking
- No `fixture.detectChanges()` — use `await fixture.whenStable()`
- No `HttpClientTestingModule` — use `provideHttpClient()` + `provideHttpClientTesting()`
- No `TestBed.flushEffects()` — use `TestBed.tick()`
- No `any` types in test code
- Mock all external dependencies
- One logical assertion per `it` block
