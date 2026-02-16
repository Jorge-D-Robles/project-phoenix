Implement a feature for Project Phoenix following the spec-driven workflow.

## Instructions

1. **Identify the feature**: Determine which feature to implement from the user's request
2. **Read the spec**: Read the relevant `docs/` file(s) for the feature:
   - Tasks → `docs/domain-models.md`, `docs/google-api-spec.md`, `docs/web-spec.md`
   - Calendar → `docs/google-api-spec.md`, `docs/web-spec.md`
   - Habits → `docs/domain-models.md`, `docs/heatmap-algorithm.md`, `docs/web-spec.md`
   - Notes → `docs/domain-models.md`, `docs/google-api-spec.md`, `docs/web-spec.md`
   - Android → `docs/android-spec.md` + the relevant feature spec
   - Always also read `docs/architecture.md` for system-level context
3. **Read testing spec**: Read `docs/testing-spec.md` for TDD conventions
4. **Plan**: Outline the implementation steps and list the files to create/modify
5. **Write specs first (TDD)**: For each unit (service, store, component, utility):
   - Create the `.spec.ts` file first, co-located with where the source will live
   - Write `describe`/`it` blocks covering happy path, edge cases, error handling
   - Run `ng test` to confirm specs compile (they should fail — Red phase)
6. **Implement**: Write the minimum code to pass the specs (Green phase):
   - Web: Standalone components, OnPush, SignalStore, no zone.js, strict typing
   - Android: Compose, ViewModel+StateFlow, Room, Hilt, WorkManager
7. **Refactor**: Clean up without breaking specs
8. **Verify**: Run through the agent checklist in the relevant spec doc
9. **Test**: Run `ng test` — all specs must pass before committing
10. **Report**: Summarize what was implemented and any decisions made

If the spec is insufficient, refer to `design.md` for the full canonical specification.
