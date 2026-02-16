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
3. **Plan**: Outline the implementation steps and list the files to create/modify
4. **Implement**: Write the code following all conventions in the spec:
   - Web: Standalone components, OnPush, SignalStore, no zone.js, strict typing
   - Android: Compose, ViewModel+StateFlow, Room, Hilt, WorkManager
5. **Verify**: Run through the agent checklist in the relevant spec doc
6. **Test**: Run any applicable tests or build commands
7. **Report**: Summarize what was implemented and any decisions made

If the spec is insufficient, refer to `design.md` for the full canonical specification.
