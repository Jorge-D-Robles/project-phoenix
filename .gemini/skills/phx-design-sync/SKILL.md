---
name: phx-design-sync
description: Synchronizes the distilled `docs/` files with the canonical `design.md` specification. Use when `design.md` has been updated or when ensuring documentation consistency.
---

# Design Sync

The `phx-design-sync` skill keeps the project's documentation in sync with its canonical specification.

## Instructions

1. **Read design.md** in full to identify recent changes.
2. **For each file in `docs/`**:
   - Compare content against corresponding section(s) in `design.md`.
   - Update content that has drifted from the canonical spec.
   - Preserve agent-optimized format (imperative language, checklists, tables).
   - Do not remove agent checklists or implementation instructions.
3. **Handle new sections**: If `design.md` has new sections without a corresponding `docs/` file, create one (lowercase-kebab-case.md).
4. **Report**: Summarize what changed in each file or state if no changes were needed.
