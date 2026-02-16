# TypeScript Style Audit

Perform a comprehensive TypeScript style audit on the specified feature area against the Google TypeScript Style Guide (`docs/google-ts-styleguide.md`) and Project Phoenix design patterns (`design.md`, `docs/web-spec.md`).

## Audit Scope

Audit the feature specified by the user argument: $ARGUMENTS

If no argument is given, audit all features.

## Steps

1. **Read the style guide**: Read `docs/google-ts-styleguide.md` for the full Google TypeScript Style Guide rules.
2. **Read design spec**: Read `docs/web-spec.md` and `design.md` for project-specific patterns.
3. **Read all source files** in the feature area (both `.ts` and `.spec.ts` files).
4. **Audit each file** against every rule in the style guide checklist.
5. **Report findings** in the format below.

## Audit Checklist

For each file, check:

### Syntax & Correctness
- [ ] Code compiles without errors
- [ ] No `any` types (use `unknown` or specific types)
- [ ] No `var` declarations (use `const`/`let`)
- [ ] No `==`/`!=` (use `===`/`!==`, exception: `== null`)
- [ ] No `@ts-ignore` or `@ts-expect-error`
- [ ] All switch statements have `default` cases
- [ ] All control structures use braces
- [ ] Explicit semicolons (no ASI reliance)

### Naming
- [ ] Classes/interfaces/types/enums: `UpperCamelCase`
- [ ] Variables/functions/methods/properties: `lowerCamelCase`
- [ ] Constants: `CONSTANT_CASE`
- [ ] No `I` prefix on interfaces
- [ ] No trailing/leading underscores on private members
- [ ] Abbreviations treated as words (`loadHttpUrl` not `loadHTTPURL`)

### Imports & Exports
- [ ] Named exports only (no `export default`)
- [ ] `import type` for type-only imports
- [ ] No `namespace` keyword
- [ ] No `require()` calls
- [ ] Minimal API surface (only export what's needed)

### Types
- [ ] `interface` preferred over `type` alias for object types
- [ ] `T[]` for simple types, `Array<T>` for complex
- [ ] Optional `?` preferred over `|undefined`
- [ ] No wrapper types (`String`/`Boolean`/`Number`)
- [ ] Type inference used where trivial
- [ ] `as` syntax for assertions (not angle brackets)

### Classes & Functions
- [ ] `readonly` on never-reassigned properties
- [ ] Parameter properties used where appropriate
- [ ] Visibility restricted maximally (`private` > `protected` > public)
- [ ] No `public` keyword except non-readonly parameter properties
- [ ] Template-bound properties use `protected` (Angular)
- [ ] Arrow functions preferred over function expressions
- [ ] `throw new Error(...)` — never throw strings

### Angular Patterns (Project-Specific)
- [ ] Standalone components
- [ ] `ChangeDetectionStrategy.OnPush`
- [ ] Signal-based inputs/outputs (`input()`, `output()`)
- [ ] SignalStore patterns (withState, withComputed, withMethods)
- [ ] No zone.js dependencies
- [ ] Decorators immediately precede decorated symbol

### Test Quality
- [ ] Every spec has meaningful assertions (no empty `it` blocks)
- [ ] Mocks are properly typed
- [ ] `await fixture.whenStable()` used (zoneless)
- [ ] Describe blocks match component/service names
- [ ] Edge cases covered

## Output Format

```
## [Feature Area] Audit Report

### Summary
- Files audited: N
- Issues found: N (Critical: N, Warning: N, Info: N)

### File: path/to/file.ts

#### Critical
- [Line X] Description of issue — Rule: [rule name]

#### Warning
- [Line X] Description of issue — Rule: [rule name]

#### Info
- [Line X] Suggestion — Rule: [rule name]

### Recommendations
1. Actionable fix description
```

Severity levels:
- **Critical**: Breaks style guide rules, potential bugs, `any` usage, incorrect types
- **Warning**: Style inconsistencies, missing `readonly`, visibility too broad
- **Info**: Minor improvements, documentation suggestions
