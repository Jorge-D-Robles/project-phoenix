# Phoenix Task Board

This board uses a ticket-based system to track granular units of work.

## Ticket Format
`[PHX-XXX] Title | Status | Assignee`

**Statuses:** `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`, `BLOCKED`

---

## 🏃 Active Sprint

| ID | Task | Status | Assignee | Created |
|:---|:---|:---:|:---|:---:|

## 📋 Backlog (Phase 1: Foundation)

| ID | Task | Status | Priority |
|:---|:---|:---:|:---:|
| PHX-004 | Scaffold Angular 21 project (Zoneless) | TODO | High |
| PHX-005 | Configure Material 3 Theme & Dark Mode | TODO | Medium |
| PHX-006 | Implement OAuth 2.0 PKCE AuthService | TODO | High |

## ✅ Completed

| ID | Task | Completed | Assignee |
|:---|:---|:---:|:---|
| PHX-001 | Initialize `agents/` tracking system | 2026-02-16 | Gemini |
| PHX-002 | Migrate `docs/roadmap.md` to `agents/ROADMAP.md` | 2026-02-16 | Gemini |
| PHX-003 | Implement root `CLAUDE.md` updates for agent tracking | 2026-02-16 | Gemini |

---

## Workflow Rules for Agents

1. **Claiming**: Change status from `TODO` to `IN_PROGRESS` and set yourself as `Assignee`.
2. **Atomic Work**: Every PR/Commit should ideally correspond to one or more PHX tickets.
3. **Closing**: Move to `DONE` and record the completion date.
4. **Cleanup**: Periodically archive `DONE` tasks if the list grows too long.
5. **New Tasks**: Use the next sequential ID when creating new tickets.
