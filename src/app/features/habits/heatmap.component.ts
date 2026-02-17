import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { HeatmapCellComponent } from './heatmap-cell.component';
import { HabitLog, getLevel } from '../../data/models/habit.model';

/** Number of weeks to display in the heatmap */
const WEEKS = 52;
/** Days per week */
const DAYS_PER_WEEK = 7;
/** Total cells in the heatmap grid */
const TOTAL_CELLS = WEEKS * DAYS_PER_WEEK;

const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export interface HeatmapCell {
  readonly date: string;
  readonly level: number;
  readonly weekIndex: number;
}

export interface MonthLabel {
  readonly name: string;
  readonly column: number;
}

@Component({
  selector: 'app-heatmap',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeatmapCellComponent],
  template: `
    <div class="heatmap-wrapper overflow-x-auto" data-testid="heatmap-wrapper">
      <div class="heatmap-container">
        <!-- Month labels row -->
        <div class="month-labels" data-testid="month-labels">
          @for (label of monthLabels(); track label.column) {
            <span class="month-label" [style.grid-column]="label.column + 1">
              {{ label.name }}
            </span>
          }
        </div>

        <!-- Heatmap grid -->
        <div data-testid="heatmap-grid" class="heatmap-grid">
          @for (cell of cells(); track cell.date) {
            <app-heatmap-cell [level]="cell.level" [date]="cell.date" />
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .heatmap-wrapper {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    .heatmap-container {
      width: fit-content;
      min-width: 100%;
    }
    .month-labels {
      display: grid;
      grid-template-columns: repeat(52, 14px);
      gap: 0;
      margin-bottom: 4px;
      height: 16px;
    }
    .month-label {
      font-size: 11px;
      color: var(--mat-sys-on-surface-variant, #666);
      white-space: nowrap;
    }
    .heatmap-grid {
      display: grid;
      grid-template-rows: repeat(7, 14px);
      grid-template-columns: repeat(52, 14px);
      grid-auto-flow: column;
      gap: 2px;
    }
  `],
})
export class HeatmapComponent {
  logs = input.required<HabitLog[]>();

  cells = computed<HeatmapCell[]>(() => {
    const logEntries = this.logs();

    // Build a map of date -> value for quick lookup
    const logMap = new Map<string, number>();
    for (const log of logEntries) {
      logMap.set(log.date, (logMap.get(log.date) ?? 0) + log.value);
    }

    // Find max value for level calculation
    let maxValue = 0;
    for (const value of logMap.values()) {
      if (value > maxValue) maxValue = value;
    }

    // Generate cells for the past 364 days (52 weeks * 7 days)
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (TOTAL_CELLS - 1));

    const cells: HeatmapCell[] = [];
    for (let i = 0; i < TOTAL_CELLS; i++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + i);
      const year = cellDate.getFullYear();
      const month = String(cellDate.getMonth() + 1).padStart(2, '0');
      const day = String(cellDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const value = logMap.get(dateStr) ?? 0;
      cells.push({
        date: dateStr,
        level: getLevel(value, maxValue),
        weekIndex: Math.floor(i / DAYS_PER_WEEK),
      });
    }

    return cells;
  });

  monthLabels = computed<MonthLabel[]>(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (TOTAL_CELLS - 1));

    const labels: MonthLabel[] = [];
    let lastMonth = -1;

    for (let week = 0; week < WEEKS; week++) {
      // Check the first day (row 0) of each week column
      const dayOffset = week * DAYS_PER_WEEK;
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + dayOffset);
      const month = cellDate.getMonth();

      if (month !== lastMonth) {
        labels.push({ name: SHORT_MONTHS[month], column: week });
        lastMonth = month;
      }
    }

    return labels;
  });
}
