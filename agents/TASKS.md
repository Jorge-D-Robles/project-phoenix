# Phoenix Task Board

This board uses a ticket-based system to track granular units of work.

## Ticket Format
`[PHX-XXX] Title | Status | Assignee`

**Statuses:** `TODO`, \`IN_PROGRESS\`, \`REVIEW\`, \`DONE\`, \`BLOCKED\`

---

## 🏃 Active Sprint

| ID | Task | Status | Assignee | Created |
|:---|:---|:---:|:---|:---:|
| — | Phase 2 complete. Next: Phase 3 (Calendar) | — | — | — |

## 📋 Backlog (Phase 2: Tasks)

| ID | Task | Status | Priority |
|:---|:---|:---:|:---:|
| PHX-012 | Configure Experimental Zoneless Change Detection | DONE | Gemini | 2026-02-16 |
| PHX-013 | Refactor `AuthService` to use `SignalStore` | DONE | Gemini | 2026-02-16 |
| PHX-014 | Persist `localId` in `TaskMeta` | DONE | Gemini | 2026-02-16 |
| PHX-015 | Fix hollow unit tests in `task.service.spec.ts` | DONE | Gemini | 2026-02-16 |
| PHX-016 | Implement incremental OAuth scope request for Tasks API | TODO | Low |
|:---|:---|:---:|:---:|

## 🏗️ In Progress

| ID | Task | Status | Assignee |
|:---|:---|:---:|:---|

## ✅ Completed

| ID | Task | Completed | Assignee |
|:---|:---|:---:|:---|
| PHX-021 | Implement drag-and-drop task reordering | 2026-02-16 | Claude |
| PHX-020 | Implement 429 exponential backoff retry interceptor | 2026-02-16 | Claude |
| PHX-019 | Build `TaskDetailDialogComponent` (create/edit) | 2026-02-16 | Claude |
| PHX-018 | Build `TaskListComponent` (smart container) | 2026-02-16 | Claude |
| PHX-017 | Build `TaskCardComponent` (presentational) | 2026-02-16 | Claude |
| PHX-009 | Create Task List and Detail UI components | 2026-02-16 | Claude |
| PHX-013 | Refactor `AuthService` to use `SignalStore` | 2026-02-16 | Gemini |
| PHX-015 | Fix hollow unit tests in `task.service.spec.ts` | 2026-02-16 | Gemini |
| PHX-014 | Persist `localId` in `TaskMeta` | 2026-02-16 | Gemini |
| PHX-012 | Configure Experimental Zoneless Change Detection | 2026-02-16 | Gemini |
| PHX-011 | Run initial codebase audit via `/auditor` | 2026-02-16 | Gemini |
| PHX-010 | Implement Phoenix metadata parser for Tasks | 2026-02-16 | Claude |
| PHX-008 | Build `TaskService` for Google Tasks API | 2026-02-16 | Claude |
| PHX-007 | Implement `TasksStore` using NgRx Signals | 2026-02-16 | Claude |
| PHX-006 | Implement OAuth 2.0 PKCE AuthService | 2026-02-16 | Claude |
| PHX-005 | Configure Material 3 Theme & Dark Mode | 2026-02-16 | Claude |
| PHX-004 | Scaffold Angular 21 project (Zoneless) | 2026-02-16 | Claude |
| PHX-003 | Implement root `CLAUDE.md` updates for agent tracking | 2026-02-16 | Gemini |
| PHX-002 | Migrate `docs/roadmap.md` to `agents/ROADMAP.md` | 2026-02-16 | Gemini |
| PHX-001 | Initialize `agents/` tracking system | 2026-02-16 | Gemini |

---

## Workflow Rules for Agents

1. **Claiming**: Change status from `TODO` to `IN_PROGRESS` and set yourself as \`Assignee\`.
2. **Decomposition**: When a ticket involves multiple distinct steps, break it into sub-task tickets (e.g. `PHX-010a`, `PHX-010b` or simply the next sequential IDs) with a `Blocked by: PHX-parent` note. Complete and commit each sub-task individually before moving to the next.
3. **Atomic Work**: Every PR should correspond to one PHX ticket (or sub-task). Keep PRs under 200 lines of diff — if a change is larger, decompose further. Exception: scaffolding/code-gen PRs.
4. **Tests Pass**: All tests must pass before submitting a PR. Add tests for any new or changed behavior.
5. **Closing**: Move to `DONE` and record the completion date.
6. **Cleanup**: Periodically archive `DONE` tasks if the list grows too long.
7. **New Tasks**: Use the next sequential ID when creating new tickets.
8. **Quality Review (Gemini)**: Gemini acts as a Principal Engineer. Periodic `/auditor` checks are mandatory to ensure design compliance, roadmap health, and workflow adherence. Historical context from prior PRs and commits must be reviewed for every major change.
