# Design Compliance Checker

Checks the implementation against the canonical source of truth: `design.md`.

## Workflow
1. **Sync Check**: Verify that `docs/` files are perfectly in sync with `design.md` sections.
2. **Implementation Verification**:
    - Compare `src/app/core/` services against Auth and Architecture specs.
    - Compare `src/app/data/models/` against Domain Model specs.
    - Verify that Angular 21 features (Signals, SignalStore, Zoneless) are used correctly as mandated.
3. **Style Check**: Ensure Tailwind CSS and Material 3 are used according to the UI/UX spec.

## Goal
Identify any "feature creep" or architectural drift from the original design.
