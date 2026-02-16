---
name: phx-auditor
description: Performs a comprehensive, principal-engineer-level audit of the Project Phoenix codebase, including design compliance, roadmap health, and agent performance. Use when requested to audit the codebase, check project health, or verify architectural alignment.
---

# Auditor

The `phx-auditor` skill performs a comprehensive audit to verify that the project is adhering to its architectural principles, security standards, and roadmap commitments.

## Core Audit Workflow

1. **Design Compliance**: Verify implementation against `design.md`. See [design-compliance.md](references/design-compliance.md).
2. **Roadmap Health**: Verify task progress and milestone realism. See [roadmap-health.md](references/roadmap-health.md).
3. **Agent Performance**: Check adherence to TDD, git workflows, and documentation rules. See [agent-review.md](references/agent-review.md).
4. **Historical Context**: Analyze evolution and identify recurring anti-patterns. See [historical-review.md](references/historical-review.md).
5. **Security & Quality Audit**: Manually inspect critical paths (Auth, Sync, Data Models) for Google Principal Engineer standards (thoroughness, scalability, idiomatic code).

## Output Requirement

Produce a structured `AUDIT_REPORT.md` (saved in `agents/audits/`) detailing:
- **Critical Findings**: Major deviations from design or security risks.
- **Workflow Health**: Score on agent adherence to TDD and Git rules.
- **Roadmap Alignment**: Assessment of whether we are on track for Phase milestones.
- **Action Items**: Specific tickets to be created in `TASKS.md` to resolve findings.
