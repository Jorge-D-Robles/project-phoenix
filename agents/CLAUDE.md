# Agent Tracking & Maintenance

This directory is the control center for Project Phoenix's task management.

## 🤖 Agent Responsibilities

### 1. Synchronize State
Before starting work, check `agents/TASKS.md` for `IN_PROGRESS` items to avoid duplication. After completing work, update the ticket status.

### 2. Ticket Lifecycle
- **Create**: If a task is not tracked, create a `[PHX-XXX]` ticket in the Backlog.
- **Claim**: Update status to `IN_PROGRESS` and `Assignee` to your name.
- **Finish**: Move to `DONE` with a completion date.

### 3. Documentation Hygiene
- Update `agents/ROADMAP.md` health stats when major milestones are hit.
- Keep `CLAUDE.md` (root) and `agents/` docs in sync regarding workflow changes.

## 🛠 Maintenance Commands
- `/sync-tasks` (Proposed): Validate that all `IN_PROGRESS` tasks are actually being worked on.
- `/cleanup-done`: Move `DONE` items to an archive or bottom of the list.

## 📂 Layout
- `TASKS.md`: Granular tickets (The "What").
- `ROADMAP.md`: High-level milestones (The "When").
- `CLAUDE.md`: Workflow instructions for this folder.
