# Project Phoenix — Unified Productivity Ecosystem

## Architecture

- **Client-Centric Aggregator**: No backend. Clients sync directly to Google Workspace APIs.
- Google APIs are the Remote Source of Truth; local state is the UI's source of truth.
- Google Drive Application Data Folder serves as a pseudo-backend for habits and config.

## Tech Stack

- **Web**: Angular 21+ (Signals, zoneless, SignalStore), Material 3
- **UI Components**: Angular Material (Google's Material Components) — prefer built-in Material components over custom implementations
- **CSS**: Tailwind CSS — utility-first styling for all custom layout and design beyond Material components
- **Android**: Kotlin, Jetpack Compose, Room, Hilt, WorkManager
- **Auth**: OAuth 2.0 PKCE on both platforms
- **APIs**: Google Tasks, Calendar, Drive, Docs

## Source of Truth

- `design.md` — canonical technical specification. Always defer to it for ambiguity.
- `docs/` — distilled agent-ready reference docs (see below).

## Agent Workflow

1. **Pull first**: Run `git pull origin main` before starting any work.
2. **Check Tasks**: Read `agents/TASKS.md` to identify the next priority ticket (`PHX-XXX`).
3. **Claim Ticket**: Mark the ticket as `IN_PROGRESS` and set yourself as `Assignee`.
4. **Decompose Large Tasks**: If a ticket involves multiple distinct steps (e.g. scaffolding, wiring, testing), break it into sub-tasks and log each as a new `PHX-XXX` ticket in `agents/TASKS.md` with a `Blocked by: PHX-parent` note. Work through sub-tasks sequentially, completing and committing each before moving to the next.
5. **Read Spec**: Read the relevant `docs/` spec before implementing any feature.
6. **Implement & Verify**: Follow conventions and refer to `design.md` for full context. Focus on one sub-task at a time — finish it, verify it, commit it.
7. **Update Ticket**: Upon completion of each sub-task (or the full ticket if it was not decomposed), move it to `DONE` in `agents/TASKS.md`.
8. **Sync Roadmap**: After completing a major ticket or a phase deliverable, update `agents/ROADMAP.md` to reflect the current progress (e.g., check off deliverables, update project health).
9. **Prepare Next Work**: Before finishing a session, ensure `agents/TASKS.md` has actionable `TODO` tickets in the backlog so the next agent can immediately pick up work. If a completed ticket unlocks new work, create those tickets now. If a phase is complete, populate the next phase's backlog from `agents/ROADMAP.md`.
10. **Sync & Push**: Follow the Git Workflow below after every fully validated change.

## Git Workflow

This repo uses **git worktrees**. The main repo lives at the parent directory (e.g. `/Users/robles/repos/project-phoenix`) with `main` checked out. Feature branches are checked out in `.worktrees/<branch-name>`. Because `main` is already checked out in the parent, you cannot `git checkout main` from a worktree.

After every complete and fully validated change, run these steps in order:

```bash
# 1. Stage relevant files (never use `git add -A` — be explicit)
git add <files>

# 2. Commit on the current worktree branch
git commit -m "descriptive message"

# 3. Push the worktree branch to origin
git push -u origin <branch>

# 4. Merge into main from the parent repo (worktrees can't checkout main)
git -C /Users/robles/repos/project-phoenix merge <branch>

# 5. Push main to origin
git -C /Users/robles/repos/project-phoenix push origin main

# 6. Pull into the worktree to stay in sync
git pull origin main
```

Do not skip steps. Do not use `git checkout main` from a worktree — it will fail.

## Pull Request Standards

- **Small & self-contained**: Aim for PRs under 200 lines of diff. If a change grows larger, split it into sequential PRs that each stand on their own. Exception: code generation or project scaffolding (e.g. `ng new`, initial boilerplate) may exceed this limit.
- **Tests required**: Every PR must include tests for new or changed behavior. Use the TDD workflow (`/unit-test-writer`) to generate specs before implementation.
- **Green before submit**: All existing and new tests must pass before a PR is opened. Run the full test suite and fix any failures first — never submit a PR with known test breakage.
- **One concern per PR**: A PR should address a single ticket, bug fix, or feature slice. Avoid bundling unrelated changes.

## Self-Improvement Rule

After completing any task, evaluate whether something was learned that should be preserved:

- **Successful pattern**: If a technique, workaround, or approach worked well and would be useful in future sessions, add it to the appropriate file (`CLAUDE.md`, relevant `docs/` spec, or a new `docs/` file if needed).
- **Pitfall or common issue**: If an error, gotcha, or unexpected behavior was encountered and resolved, document it as a warning or known issue so future sessions don't repeat the mistake.
- **Updated best practice**: If a convention, workflow step, or tool usage was refined during the session, update the existing documentation to reflect the better approach.
- **New skill or subagent**: If a task required a multi-step workflow that could be reused (e.g. a repeated validation sequence, a common generation pattern, or a cross-cutting concern), create a new slash command in `.claude/commands/` or propose a subagent definition. Do this when the pattern has been executed successfully at least once and would save time or reduce errors in future sessions.

### Where to document

| What was learned | Where to add it |
|-----------------|----------------|
| Repo-wide workflow or tooling lesson | `CLAUDE.md` (this file) |
| Domain-specific insight (e.g. API quirk) | The relevant `docs/` spec file |
| New domain not yet covered | New `docs/<topic>.md` file |
| Docs-level process change | `docs/CLAUDE.md` |
| Reusable multi-step workflow | New `.claude/commands/<name>.md` slash command |

### Rules

- Keep additions concise — a sentence or a bullet point, not an essay
- Use the same imperative, checklist-driven style as existing docs
- Include the change in the same commit as the work that triggered it when possible
- Do not wait to be asked — proactively update docs as part of finishing a task

## Testing Strategy (TDD)

- **Test-Driven Development**: Write `.spec.ts` before implementation (Red → Green → Refactor)
- **Runner**: Karma + Jasmine (not the Angular 21 default of Vitest)
- **Spec**: See `docs/testing-spec.md` for full conventions and patterns
- **Command**: Use `/unit-test-writer` to generate specs for a feature

## Conventions

- **Dates**: ISO 8601 UTC
- **Local IDs**: UUID v4
- **Metadata packing**: `\n---PHOENIX_META---\n` delimiter in Google Tasks notes field
- **Web**: Standalone components, OnPush, SignalStore, no zone.js, Tailwind CSS, Angular Material components
- **Android**: Compose, Room, Hilt DI, WorkManager sync

## Repo Layout

```
design.md                  — Canonical technical specification
agents/                    — Agent-led task tracking and roadmap
  TASKS.md                 — Active ticket board (PHX-XXX)
  ROADMAP.md               — Full roadmap with deliverables + acceptance criteria
docs/                      — Distilled agent-ready reference docs
  architecture.md          — System philosophy, aggregator model, tech stack
  domain-models.md         — Task, Habit, Note schemas + validation rules
  google-api-spec.md       — Auth, Tasks, Calendar, Drive integration
  web-spec.md              — Angular 21+ architecture, SignalStore, components
  android-spec.md          — Kotlin/Compose, Room, WorkManager, MVVM
  heatmap-algorithm.md     — Quartile math, grid positioning
  testing-spec.md          — TDD strategy, Karma/Jasmine, Angular 21+ patterns
  roadmap.md               — Pointer to agents/ROADMAP.md
.claude/commands/          — Workflow slash commands
  implement-feature.md     — Guided feature implementation workflow
  sync-design.md           — Sync docs/ from design.md changes
  unit-test-writer.md      — Generate TDD-style unit tests
```
