# Unit Testing Workflow (TDD)

Write unit tests for a Phoenix feature following TDD conventions.

## Workflow

1. **Read testing spec**: Read `docs/testing-spec.md` for conventions.
2. **Read feature spec**: Understand expected behavior from relevant `docs/` files.
3. **Write spec file**:
   - Create `<filename>.spec.ts` co-located with the source file.
   - Follow `describe`/`it` pattern from `docs/testing-spec.md`.
   - Cover: happy path, edge cases (null, empty, boundary), error handling.
   - Use correct testing pattern for the layer (see `docs/testing-spec.md`).
4. **Verify**: Run `ng test` to confirm specs compile and fail (Red phase).
5. **Implement source**: Write code until specs pass (Green phase).

## Key Rules
- No `fakeAsync`/`tick` — use `jasmine.clock()`.
- No `fixture.detectChanges()` — use `await fixture.whenStable()`.
- No `HttpClientTestingModule` — use `provideHttpClient()` + `provideHttpClientTesting()`.
- No `any` types.
- Mock all external dependencies.
- One logical assertion per `it` block.
