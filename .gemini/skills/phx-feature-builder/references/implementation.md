# Feature Implementation Workflow

Follow this spec-driven workflow for implementing features.

## Workflow

1. **Read the spec**: Read relevant `docs/` files for the feature:
   - Tasks → `docs/domain-models.md`, `docs/google-api-spec.md`, `docs/web-spec.md`
   - Calendar → `docs/google-api-spec.md`, `docs/web-spec.md`
   - Habits → `docs/domain-models.md`, `docs/heatmap-algorithm.md`, `docs/web-spec.md`
   - Notes → `docs/domain-models.md`, `docs/google-api-spec.md`, `docs/web-spec.md`
   - Android → `docs/android-spec.md` + the relevant feature spec
   - Always also read `docs/architecture.md` for system-level context
2. **Plan**: Outline implementation steps and list files to create/modify.
3. **Write specs first (TDD)**: See [unit-testing.md](unit-testing.md).
4. **Implement**: Write minimum code to pass specs (Green phase):
   - Web: Standalone components, OnPush, SignalStore, no zone.js, strict typing
   - Android: Compose, ViewModel+StateFlow, Room, Hilt, WorkManager
5. **Refactor**: Clean up without breaking specs.
6. **Verify**: Run through agent checklist in the relevant spec doc.
7. **Test**: Run `ng test` — all specs must pass before committing.
