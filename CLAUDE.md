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

1. Read the relevant `docs/` spec before implementing any feature
2. Follow the conventions below
3. Reference `design.md` for full context when `docs/` is insufficient
4. After every complete and fully validated change: follow the Git Workflow below

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
