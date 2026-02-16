---
name: phx-feature-builder
description: Guides the implementation of Project Phoenix features using a spec-driven, TDD workflow. Use when adding new features, modifying existing ones, or writing unit tests to ensure compliance with project standards.
---

# Feature Builder

The `phx-feature-builder` skill ensures that all features are implemented following the project's strict architectural and testing standards.

## Core Workflows

1. **Feature Implementation**: Follow the spec-driven development process. See [implementation.md](references/implementation.md).
2. **Unit Testing (TDD)**: Write and verify specs before implementation. See [unit-testing.md](references/unit-testing.md).

## Project Standards

- **Tech Stack**: Angular 21 (Signals, SignalStore, Zoneless), Tailwind CSS, Material 3.
- **TDD Mandatory**: All code must be covered by unit tests written *before* or alongside implementation.
- **Spec-Driven**: `design.md` and `docs/` are the absolute sources of truth.
