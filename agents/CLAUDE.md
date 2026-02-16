# Agent Tracking & Maintenance

This directory is the control center for Project Phoenix's task management.

## 🤖 Agent Responsibilities

### 1. Principal Engineer Reviewer (Gemini)
The primary role of Gemini is to act as a **Quality Reviewer & Auditor**. This includes:
- **Design Authority**: Ensuring all implementation follows `design.md` and Google Principal Engineer standards.
- **Auditor Agent**: Running regular codebase audits via `/auditor` to verify architectural integrity, roadmap health, and agent performance.
- **Historical Analysis**: Reviewing prior PRs and commits to maintain context and avoid regressions.

### 2. Synchronize State
Before starting work, check `agents/TASKS.md` for `IN_PROGRESS` items to avoid duplication. After completing work, update the ticket status.

### 3. Ticket Lifecycle
- **Create**: If a task is not tracked, create a `[PHX-XXX]` ticket in the Backlog.
- **Claim**: Update status to `IN_PROGRESS` and `Assignee` to your name.
- **Finish**: Move to `DONE` with a completion date.

### 4. Documentation Hygiene
- Update `agents/ROADMAP.md` health stats when major milestones are hit.
- Keep `CLAUDE.md` (root) and `agents/` docs in sync regarding workflow changes.

## 🛠 Reviewer Commands
- `/auditor`: Run a full codebase audit (Quality, Design, Roadmap, Agents).
- `/design-compliance`: Check current code against `design.md`.
- `/roadmap-health`: Evaluate project velocity and milestone status.
- `/agent-review`: Review agent workflow adherence (TDD, Git, Docs).
- `/historical-review`: Analyze repository history for context.

## 📂 Layout
- `TASKS.md`: Granular tickets (The "What").
- `ROADMAP.md`: High-level milestones (The "When").
- `CLAUDE.md`: Workflow instructions for this folder.
