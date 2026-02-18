import {
  afterNextRender, ChangeDetectionStrategy, Component, computed,
  ElementRef, inject, input, viewChild,
} from '@angular/core';
import { HeatmapCellComponent, LIGHT_COLORS, DARK_COLORS } from './heatmap-cell.component';
import { HabitLog, getLevel } from '../../data/models/habit.model';
import { ThemeService } from '../../core/theme.service';
import { toDateKey, SHORT_MONTHS } from '../../shared/date.utils';

/** Number of weeks to display in the heatmap */
const WEEKS = 52;
/** Days per week */
const DAYS_PER_WEEK = 7;
/** Total cells in the heatmap grid */
const TOTAL_CELLS = WEEKS * DAYS_PER_WEEK;

interface HeatmapCell {
  readonly date: string;
  readonly level: number;
  readonly weekIndex: number;
  readonly monthStart: boolean;
  readonly isToday: boolean;
  readonly isFuture: boolean;
}

interface MonthLabel {
  readonly name: string;
  readonly column: number;
}

@Component({
  selector: 'app-heatmap',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeatmapCellComponent],
  template: `
    <div class="heatmap-wrapper" data-testid="heatmap-wrapper">
      <div class="heatmap-layout">
        <!-- Day labels (Mon, Wed, Fri) -->
        <div class="day-labels">
          <div class="month-spacer"></div>
          <div class="day-grid">
            @for (day of dayLabels; track $index) {
              <span class="day-label">{{ day }}</span>
            }
          </div>
        </div>

        <!-- Scrollable grid area -->
        <div class="grid-area" #gridArea>
          <div class="grid-content">
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
      </div>

      <!-- Legend -->
      <div class="legend">
        <span class="legend-text">Less</span>
        @for (color of legendColors(); track $index) {
          <div class="legend-cell" [style.backgroundColor]="color"></div>
        }
        <span class="legend-text">More</span>
      </div>
    </div>
  `,
  styles: [`
    .heatmap-layout {
      display: flex;
      align-items: flex-start;
    }
    .day-labels {
      flex-shrink: 0;
      margin-right: 4px;
    }
    .month-spacer {
      height: 18px;
    }
    .day-grid {
      display: grid;
      grid-template-rows: repeat(7, 10px);
      gap: 2px;
    }
    .day-label {
      font-size: 9px;
      color: var(--mat-sys-on-surface-variant, #666);
      line-height: 10px;
    }
    .grid-area {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      min-width: 0;
    }
    .grid-content {
      width: fit-content;
    }
    .month-labels {
      display: grid;
      grid-template-columns: repeat(52, 10px);
      column-gap: 2px;
      height: 14px;
      margin-bottom: 4px;
    }
    .month-label {
      font-size: 10px;
      color: var(--mat-sys-on-surface-variant, #666);
      white-space: nowrap;
    }
    .heatmap-grid {
      display: grid;
      grid-template-rows: repeat(7, 10px);
      grid-template-columns: repeat(52, 10px);
      grid-auto-flow: column;
      gap: 2px;
    }
    .legend {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 3px;
      margin-top: 8px;
    }
    .legend-text {
      font-size: 9px;
      color: var(--mat-sys-on-surface-variant, #666);
      margin: 0 2px;
    }
    .legend-cell {
      width: 10px;
      height: 10px;
      border-radius: 2px;
    }
  `],
})
export class HeatmapComponent {
  private readonly themeService = inject(ThemeService);
  private readonly gridArea = viewChild<ElementRef<HTMLElement>>('gridArea');

  readonly logs = input.required<HabitLog[]>();

  readonly dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  constructor() {
    // Auto-scroll to the right so today is visible
    afterNextRender(() => {
      const el = this.gridArea()?.nativeElement;
      if (el) {
        el.scrollLeft = el.scrollWidth;
      }
    });
  }

  readonly legendColors = computed(() => {
    const palette = this.themeService.isDark() ? DARK_COLORS : LIGHT_COLORS;
    return [0, 1, 2, 3, 4].map(lvl => palette[lvl]);
  });

  readonly cells = computed<HeatmapCell[]>(() => {
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
    const todayStr = toDateKey(today);

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
      const dateStr = toDateKey(cellDate);
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

  readonly monthLabels = computed<MonthLabel[]>(() => {
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
