import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { HeatmapCellComponent } from './heatmap-cell.component';
import { HabitLog, getLevel } from '../../data/models/habit.model';

/** Number of weeks to display in the heatmap */
const WEEKS = 52;
/** Days per week */
const DAYS_PER_WEEK = 7;
/** Total cells in the heatmap grid */
const TOTAL_CELLS = WEEKS * DAYS_PER_WEEK;

interface HeatmapCell {
  date: string;
  level: number;
}

@Component({
  selector: 'app-heatmap',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeatmapCellComponent],
  template: `
    <div data-testid="heatmap-grid" class="heatmap-grid">
      @for (cell of cells(); track cell.date) {
        <app-heatmap-cell [level]="cell.level" />
      }
    </div>
  `,
  styles: [`
    .heatmap-grid {
      display: grid;
      grid-template-rows: repeat(7, 1fr);
      grid-auto-flow: column;
      gap: 2px;
      width: fit-content;
    }
  `],
})
export class HeatmapComponent {
  logs = input.required<HabitLog[]>();
  color = input.required<string>();

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
      const dateStr = cellDate.toISOString().split('T')[0];
      const value = logMap.get(dateStr) ?? 0;
      cells.push({
        date: dateStr,
        level: getLevel(value, maxValue),
      });
    }

    return cells;
  });
}
