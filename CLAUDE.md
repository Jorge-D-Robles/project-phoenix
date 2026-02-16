# Project Phoenix — Unified Productivity Ecosystem

## Architecture

- **Client-Centric Aggregator**: No backend. Clients sync directly to Google Workspace APIs.
- Google APIs are the Remote Source of Truth; local state is the UI's source of truth.
- Google Drive Application Data Folder serves as a pseudo-backend for habits and config.

## Tech Stack

- **Web**: Angular 21+ (Signals, zoneless, SignalStore), Material 3
- **Android**: Kotlin, Jetpack Compose, Room, Hilt, WorkManager
- **Auth**: OAuth 2.0 PKCE on both platforms
- **APIs**: Google Tasks, Calendar, Drive, Docs

## Source of Truth

- `design.md` — canonical technical specification. Always defer to it for ambiguity.
- `docs/` — distilled agent-ready reference docs (see below).

## Agent Workflow

1. **Pull first**: Run `git pull origin main` before starting any work — other agents may be working on this codebase concurrently
2. Read the relevant `docs/` spec before implementing any feature
3. Follow the conventions below
4. Reference `design.md` for full context when `docs/` is insufficient
5. After every complete and fully validated change: follow the Git Workflow below

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

## Conventions

- **Dates**: ISO 8601 UTC
- **Local IDs**: UUID v4
- **Metadata packing**: `\n---PHOENIX_META---\n` delimiter in Google Tasks notes field
- **Web**: Standalone components, OnPush, SignalStore, no zone.js
- **Android**: Compose, Room, Hilt DI, WorkManager sync

## Repo Layout

```
design.md                  — Canonical technical specification
docs/                      — Distilled agent-ready reference docs
  architecture.md          — System philosophy, aggregator model, tech stack
  domain-models.md         — Task, Habit, Note schemas + validation rules
  google-api-spec.md       — Auth, Tasks, Calendar, Drive integration
  web-spec.md              — Angular 21+ architecture, SignalStore, components
  android-spec.md          — Kotlin/Compose, Room, WorkManager, MVVM
  heatmap-algorithm.md     — Quartile math, grid positioning
  roadmap.md               — Web-first phasing plan
.claude/commands/          — Workflow slash commands
```
