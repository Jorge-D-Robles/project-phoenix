# Project Phoenix

A unified productivity ecosystem that brings Tasks, Habits, Notes, and Calendar into a single dashboard — powered by Google Workspace APIs with no proprietary backend.

## Architecture

Project Phoenix is a **Client-Centric Aggregator**. There is no backend server. Both client platforms authenticate directly with Google and sync data through Google Workspace APIs (Tasks, Calendar, Drive). User data stays in their Google account.

## Tech Stack

| Platform | Technology |
|----------|-----------|
| **Web** | Angular 21+ (Signals, zoneless), SignalStore, Material 3 |
| **Android** | Kotlin, Jetpack Compose, Room, Hilt, WorkManager |
| **Auth** | OAuth 2.0 PKCE (both platforms) |
| **Data** | Google Tasks API, Google Calendar API, Google Drive API |

## Repo Structure

```
design.md              — Canonical technical specification (source of truth)
docs/                  — Distilled reference docs for each domain
  architecture.md      — System philosophy, aggregator model, tech stack
  domain-models.md     — Task, Habit, Note schemas and validation rules
  google-api-spec.md   — Auth, Tasks, Calendar, Drive integration spec
  web-spec.md          — Angular 21+ architecture and component conventions
  android-spec.md      — Kotlin/Compose architecture and transposition guide
  heatmap-algorithm.md — Quartile math and grid positioning formulas
  roadmap.md           — Web-first phased implementation plan
CLAUDE.md              — Agent instructions for working in this repo
.claude/commands/      — Slash commands for agent workflows
```

## Getting Started

This repo is currently in the **scaffolding phase** — specifications and agent workflow tooling are in place, but no application code exists yet. See `docs/roadmap.md` for the phased implementation plan.

### For AI Agents

1. Read `CLAUDE.md` at the repo root for orientation
2. Read the relevant `docs/` spec before implementing any feature
3. Use `/implement-feature` to follow the guided implementation workflow
4. Use `/sync-design` to keep docs in sync after spec changes

### For Humans

- `design.md` is the canonical technical specification
- `docs/` contains the same information broken into focused, actionable documents
- `docs/roadmap.md` outlines the implementation phases

## License

See `LICENSE` for details.
