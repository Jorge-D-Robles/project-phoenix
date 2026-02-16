# Heatmap Algorithm — Habit Tracker Visualization

> Distilled from `design.md` §6. Refer to `design.md` for full context.

---

## Overview

The habit heatmap is a GitHub-style contribution graph showing a rolling 52-week (365-day) window. Each cell represents one day, colored by contribution intensity (4 quartile levels + empty).

---

## Quartile Calculation

### Step 1: Determine MaxValue

Find the maximum `value` across all habit log entries in the visible window:

```
MaxValue = max(log.value for all logs in the 365-day window)
```

If `MaxValue` is 0 (no activity), all cells are Level 0.

### Step 2: Assign Levels

| Level | Condition | Meaning |
|-------|-----------|---------|
| 0 | `value == 0` | No activity |
| 1 | `1 <= value <= 0.25 * Max` | Low activity |
| 2 | `0.25 * Max < value <= 0.50 * Max` | Medium activity |
| 3 | `0.50 * Max < value <= 0.75 * Max` | High activity |
| 4 | `value > 0.75 * Max` | Peak activity |

### Implementation

```
function getLevel(value, maxValue):
    if value == 0: return 0
    if maxValue == 0: return 0
    ratio = value / maxValue
    if ratio <= 0.25: return 1
    if ratio <= 0.50: return 2
    if ratio <= 0.75: return 3
    return 4
```

---

## Grid Positioning

The heatmap is a grid with 7 rows (days of the week) and ~52 columns (weeks).

### Formulas

Given a `startDate` (52 weeks ago, aligned to Sunday/Monday depending on locale):

```
DayDifference = daysBetween(startDate, log.date)
WeekIndex     = floor(DayDifference / 7)    // column (0–52)
DayIndex      = DayDifference % 7            // row (0–6, Mon–Sun or Sun–Sat)
```

### Coordinate Calculation

```
x = WeekIndex * (cellSize + gap)
y = DayIndex  * (cellSize + gap)
```

Where:
- `cellSize`: width/height of each cell (e.g., 12px web, 12.dp Android)
- `gap`: spacing between cells (e.g., 2px web, 2.dp Android)

---

## Web Implementation: CSS Grid

```css
.heatmap-grid {
  display: grid;
  grid-template-rows: repeat(7, 1fr);
  grid-auto-flow: column;
  gap: 2px;
}
```

### Cell Component

```typescript
@Component({
  selector: 'app-heatmap-cell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="cell" [attr.data-level]="level()"></div>`,
  styles: [`
    .cell { width: 12px; height: 12px; border-radius: 2px; }
    .cell[data-level="0"] { background: var(--heatmap-empty); }
    .cell[data-level="1"] { background: var(--heatmap-low); }
    .cell[data-level="2"] { background: var(--heatmap-med); }
    .cell[data-level="3"] { background: var(--heatmap-high); }
    .cell[data-level="4"] { background: var(--heatmap-peak); }
  `]
})
export class HeatmapCellComponent {
  level = input.required<number>();
}
```

- Use CSS custom properties for theming (light/dark mode)
- Grid auto-flows column-wise: items fill top-to-bottom (Mon→Sun), then move to next week

---

## Android Implementation: Canvas

```kotlin
Canvas(modifier = Modifier.fillMaxWidth().height(cellSize * 7 + gap * 6)) {
    habitLogs.forEach { log ->
        val weekIndex = daysBetween(startDate, log.date) / 7
        val dayIndex = daysBetween(startDate, log.date) % 7
        val x = weekIndex * (cellSize + gap)
        val y = dayIndex * (cellSize + gap)
        drawRect(
            color = levelToColor(log.level),
            topLeft = Offset(x, y),
            size = Size(cellSize, cellSize)
        )
    }
}
```

- Use `drawRect` — not individual Composable cells (performance)
- `levelToColor` maps 0–4 to the color palette
- Canvas redraws on state change — use `remember` for computed log positions

---

## Agent Checklist

- [ ] Quartile thresholds are 0.25, 0.50, 0.75 of MaxValue
- [ ] Level 0 is for `value == 0` only — never for non-zero values
- [ ] Grid flows column-first (fill days top-to-bottom, then next week)
- [ ] Web uses CSS Grid with `grid-auto-flow: column`
- [ ] Android uses Canvas `drawRect` (not individual Composables)
- [ ] `startDate` is aligned to the beginning of the week (locale-dependent)
- [ ] Handle empty datasets gracefully (all Level 0)
