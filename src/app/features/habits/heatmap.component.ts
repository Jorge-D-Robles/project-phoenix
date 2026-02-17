import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { HeatmapCellComponent } from './heatmap-cell.component';
import { HabitLog, getLevel } from '../../data/models/habit.model';

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

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
  readonly monthStart: boolean;
  readonly isToday: boolean;
  readonly isFuture: boolean;
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
            <app-heatmap-cell
              [level]="cell.level"
              [date]="cell.date"
              [monthStart]="cell.monthStart"
              [isToday]="cell.isToday"
              [isFuture]="cell.isFuture" />
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

    // Align grid to week boundaries: start on a Sunday, end on today
    const today = new Date();
    const todayStr = formatDate(today);

    // Go back 51 weeks from the Sunday of the current week
    const currentSunday = new Date(today);
    currentSunday.setDate(today.getDate() - today.getDay());
    const startDate = new Date(currentSunday);
    startDate.setDate(currentSunday.getDate() - (WEEKS - 1) * DAYS_PER_WEEK);

    // Pre-compute which week columns start a new month
    const monthStartWeeks = new Set<number>();
    let prevMonth = startDate.getMonth();
    for (let week = 1; week < WEEKS; week++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + week * DAYS_PER_WEEK);
      const m = d.getMonth();
      if (m !== prevMonth) {
        monthStartWeeks.add(week);
      }
      prevMonth = m;
    }

    const cells: HeatmapCell[] = [];
    for (let i = 0; i < TOTAL_CELLS; i++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + i);
      const dateStr = formatDate(cellDate);
      const isFuture = dateStr > todayStr;
      const value = isFuture ? 0 : (logMap.get(dateStr) ?? 0);
      const weekIndex = Math.floor(i / DAYS_PER_WEEK);
      cells.push({
        date: dateStr,
        level: isFuture ? -1 : getLevel(value, maxValue),
        weekIndex,
        monthStart: monthStartWeeks.has(weekIndex),
        isToday: dateStr === todayStr,
        isFuture,
      });
    }

    return cells;
  });

  monthLabels = computed<MonthLabel[]>(() => {
    const today = new Date();
    const currentSunday = new Date(today);
    currentSunday.setDate(today.getDate() - today.getDay());
    const startDate = new Date(currentSunday);
    startDate.setDate(currentSunday.getDate() - (WEEKS - 1) * DAYS_PER_WEEK);

    const allLabels: MonthLabel[] = [];
    let lastMonth = -1;

    for (let week = 0; week < WEEKS; week++) {
      const dayOffset = week * DAYS_PER_WEEK;
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + dayOffset);
      const month = cellDate.getMonth();

      if (month !== lastMonth) {
        allLabels.push({ name: SHORT_MONTHS[month], column: week });
        lastMonth = month;
      }
    }

    // Filter out labels that would overlap (need at least 3 columns apart)
    const MIN_GAP = 3;
    const labels: MonthLabel[] = [];
    for (const label of allLabels) {
      if (labels.length === 0 || label.column - labels[labels.length - 1].column >= MIN_GAP) {
        labels.push(label);
      }
    }

    return labels;
  });
}
