import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { InsightsStore } from '../../state/insights.store';
import { ScoreCardComponent } from './score-card.component';
import { TrendChartComponent } from './trend-chart.component';
import type { ChartDataPoint } from './trend-chart.component';
import { HabitStreaksWidgetComponent } from './habit-streaks-widget.component';
import { WeeklySummaryCardComponent } from './weekly-summary-card.component';

@Component({
  selector: 'app-insights',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIconModule,
    ScoreCardComponent,
    TrendChartComponent,
    HabitStreaksWidgetComponent,
    WeeklySummaryCardComponent,
  ],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <h1 class="text-2xl font-bold mb-6 flex items-center gap-2">
        <mat-icon>insights</mat-icon>
        Insights
      </h1>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Productivity Score -->
        <app-score-card
          [score]="store.productivityScore()"
          label="Productivity Score"
          data-testid="productivity-score-card">
        </app-score-card>

        <!-- Weekly Summary -->
        <app-weekly-summary-card
          [summary]="store.weekSummary()"
          data-testid="weekly-summary">
        </app-weekly-summary-card>

        <!-- Habit Streaks -->
        <app-habit-streaks-widget
          [streaks]="store.habitStreaks()"
          data-testid="habit-streaks">
        </app-habit-streaks-widget>

        <!-- Tasks Completed Trend -->
        <app-trend-chart
          [data]="taskChartData()"
          [maxValue]="taskChartMax()"
          title="Tasks Completed (28 days)"
          color="#4CAF50"
          data-testid="task-trend-chart">
        </app-trend-chart>

        <!-- Events Trend -->
        <app-trend-chart
          [data]="eventChartData()"
          [maxValue]="eventChartMax()"
          title="Events (28 days)"
          color="#2196F3"
          data-testid="event-trend-chart">
        </app-trend-chart>

        <!-- Focus Trend -->
        <app-trend-chart
          [data]="focusChartData()"
          [maxValue]="focusChartMax()"
          title="Focus Minutes (28 days)"
          color="#FF9800"
          data-testid="focus-trend-chart">
        </app-trend-chart>
      </div>
    </div>
  `,
})
export class InsightsComponent {
  protected readonly store = inject(InsightsStore);

  /** Convert task completion data to chart format (last 7 days for readability) */
  taskChartData = computed<ChartDataPoint[]>(() => {
    const data = this.store.taskCompletionByDay();
    return data.slice(-7).map(d => ({
      label: formatDateLabel(d.date),
      value: d.count,
    }));
  });

  taskChartMax = computed<number>(() => {
    const data = this.store.taskCompletionByDay().slice(-7);
    return Math.max(1, ...data.map(d => d.count));
  });

  eventChartData = computed<ChartDataPoint[]>(() => {
    const data = this.store.eventsByDay();
    return data.slice(-7).map(d => ({
      label: formatDateLabel(d.date),
      value: d.count,
    }));
  });

  eventChartMax = computed<number>(() => {
    const data = this.store.eventsByDay().slice(-7);
    return Math.max(1, ...data.map(d => d.count));
  });

  focusChartData = computed<ChartDataPoint[]>(() => {
    const data = this.store.focusByDay();
    return data.slice(-7).map(d => ({
      label: formatDateLabel(d.date),
      value: d.minutes,
    }));
  });

  focusChartMax = computed<number>(() => {
    const data = this.store.focusByDay().slice(-7);
    return Math.max(1, ...data.map(d => d.minutes));
  });
}

/** Format YYYY-MM-DD to short day name (Mon, Tue, etc.) */
function formatDateLabel(dateStr: string): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const date = new Date(dateStr + 'T12:00:00Z');
  return days[date.getUTCDay()];
}
