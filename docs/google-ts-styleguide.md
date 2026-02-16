# Google TypeScript Style Guide — Agent Reference

Source: https://google.github.io/styleguide/tsguide.html

This is a condensed, actionable checklist for auditing TypeScript code against Google's style guide.

---

## File Structure

- UTF-8 encoding, ASCII horizontal spaces only
- File order: copyright > @fileoverview > imports > implementation
- One blank line between each present section

## Imports & Exports

- **Named exports only** — never use `export default`
- **Named imports** for frequently-used symbols: `import {Foo} from './foo';`
- **Namespace imports** for large APIs: `import * as foo from './foo';`
- Use `import type {...}` when imported symbols are only used as types
- Use `export type` when re-exporting types
- **No `namespace`** keyword — use ES6 modules
- **No `require()`** — use ES6 `import`
- Only export symbols used outside the module — minimize API surface
- **No mutable exports** (`export let`) — use getter functions

## Variables

- **Always `const` or `let`** — never `var`
- Prefer `const` unless reassignment is needed
- One variable per declaration (`let a = 1, b = 2` is forbidden)

## Arrays

- **Never use `Array()` constructor** — use `[]` literal or `Array.from()`
- No non-numeric properties on arrays (use Map/Object instead)
- Spread only iterables into arrays, never primitives

## Objects

- **Never use `Object` constructor** — use `{}` literal
- Prefer `for (... of Object.keys(...))` over `for (... in ...)`
- Keep destructured parameters simple — single nesting level

## Classes

- **No `#private` fields** — use TypeScript's `private` modifier
- **Use `readonly`** for never-reassigned properties
- **Use parameter properties** instead of manual constructor assignment
- Initialize fields where declared when possible
- **Restrict visibility maximally** — `private` > `protected` > implicit public
- **Never write `public`** keyword except for non-readonly public parameter properties
- Properties used in Angular templates: use `protected` (not `private`)
- Never manipulate `prototype` directly

## Functions

- **Prefer function declarations** over function expressions for named functions
- **Use arrow functions** instead of function expressions
- Arrow function concise bodies only when return value is used
- **Never use `this`** outside class methods/constructors or arrow functions in valid scope
- Use rest parameters instead of `arguments`
- Never name a parameter `arguments`

## Control Flow

- **Always use braces** for `if/else/for/do/while` blocks (single-line `if` exception)
- **Triple equals only** (`===`, `!==`) — never `==`/`!=` (exception: `== null` for null/undefined)
- All `switch` statements include `default` case
- Prefer `for...of` over `forEach` or vanilla `for` loops
- Use `for...in` only on dict-style objects, never arrays

## Type Assertions

- Use `as` syntax, never angle brackets: `x as Foo` not `<Foo>x`
- Prefer runtime type checks over assertions
- Use `: Foo` annotation over `as Foo` for object literals
- If double-casting, go through `unknown` not `any`
- **Never use `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`**

## Error Handling

- Always `throw new Error(...)` — never throw strings or arbitrary values
- Promise rejections must use `Error` objects
- Keep try blocks focused
- Empty catch blocks need explanatory comments

## Type System

- **Rely on type inference** for trivial types (strings, numbers, booleans, `new` expressions)
- Explicit types for: empty collections, complex expressions, public API return types
- **Prefer `?` (optional)** over `|undefined`
- **Prefer `interface` over `type` alias** for object types
- Use `T[]` for simple types, `Array<T>` for complex types
- **Never use `any`** — prefer `unknown`, specific types, or documented suppression
- **Never use `{}` type** — prefer `unknown`, `Record<string, T>`, or `object`
- Never use wrapper types (`String`, `Boolean`, `Number`) — use `string`, `boolean`, `number`

## Naming Conventions

| Style | Use For |
|-------|---------|
| `UpperCamelCase` | classes, interfaces, types, enums, decorators, type parameters |
| `lowerCamelCase` | variables, parameters, functions, methods, properties, module aliases |
| `CONSTANT_CASE` | global constants, enum values |

- **No trailing/leading underscores** for private properties
- **No `I` prefix** on interfaces (no `IMyInterface`)
- Treat abbreviations as whole words: `loadHttpUrl` not `loadHTTPURL`
- Use clear, descriptive names — no ambiguous abbreviations
- `$` suffix for Observable values is acceptable if consistent

## Comments & Documentation

- `/** JSDoc */` for documentation (consumed by tools)
- `// line comments` for implementation notes
- JSDoc uses Markdown formatting
- No block comments (`/* */`) — use multiple `//` lines

## Disallowed Features

- `var` declarations
- `eval()` or `Function(...string)` constructors
- `debugger` statements
- `with` keyword
- `const enum` (use plain `enum`)
- Wrapper object constructors (`new String()`, `new Boolean()`, `new Number()`)
- Automatic Semicolon Insertion reliance — always use explicit semicolons
- Modifying builtin prototypes
- `namespace` keyword
- `/// <reference>` syntax

## Angular-Specific Adaptations

These rules from the style guide apply specifically to Angular code:

- Template-bound properties: use `protected` (not `private`, not `public`)
- Decorators must immediately precede the decorated symbol (no blank lines between)
- Only use framework-provided decorators (@Component, @Injectable, etc.)
- Standalone components with `ChangeDetectionStrategy.OnPush`
- Signal-based inputs (`input()`, `input.required<T>()`) and outputs (`output<T>()`)
