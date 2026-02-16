# Historical PR & Commit Reviewer

Analyzes the history of the repository to provide context for the current state.

## Workflow
1. **Commit Audit**: Run `git log -n 20 --pretty=format:"%h - %an, %ar : %s"` to see recent activity style and focus.
2. **PR Analysis**: Review recent `git diff` of major merges to understand how features were implemented and if they introduced technical debt.
3. **Pattern Recognition**: Identify if previous bugs or design flaws are being reintroduced in new code.

## Goal
Ensure that the codebase evolves with consistent intent and that past mistakes are not repeated.
