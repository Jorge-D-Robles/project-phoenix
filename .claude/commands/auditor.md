# Auditor (Codebase Audit)

The `auditor` agent performs a comprehensive, principal-engineer-level audit of the entire codebase.

## Objective
Verify that the project is adhering to its architectural principles, security standards, and roadmap commitments.

## Workflow
1. **Design Compliance**: Run `design-compliance` to ensure the current implementation matches `design.md`.
2. **Roadmap Health**: Run `roadmap-health` to verify that tasks are progressing as expected and milestones are realistic.
3. **Agent Performance**: Run `agent-review` to check if recent work followed TDD, git workflows, and documentation rules.
4. **Historical Context**: Run `historical-review` to analyze the evolution of the codebase and identify recurring anti-patterns.
5. **Security & Quality Audit**: Manually inspect critical paths (Auth, Sync, Data Models) for Google Principal Engineer standards (thoroughness, scalability, idiomatic code).

## Output
Produce a structured `AUDIT_REPORT.md` (saved in `agents/audits/`) detailing:
- **Critical Findings**: Major deviations from design or security risks.
- **Workflow Health**: Score on agent adherence to TDD and Git rules.
- **Roadmap Alignment**: Assessment of whether we are on track for Phase milestones.
- **Action Items**: Specific tickets to be created in `TASKS.md` to resolve findings.
