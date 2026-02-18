import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

export interface ChartDataPoint {
  readonly label: string;
  readonly value: number;
}

@Component({
  selector: 'app-trend-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule],
  template: `
    <mat-card class="h-full">
      <mat-card-content class="p-4">
        <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4"
            data-testid="chart-title">
          {{ title() }}
        </h3>
        <div class="flex items-end gap-1 h-32" data-testid="chart-container">
          @for (point of data(); track point.label) {
            <div class="flex flex-col items-center flex-1 h-full justify-end">
              <div class="w-full rounded-t min-h-0"
                   data-testid="chart-bar"
                   [style.height.%]="getBarHeight(point.value)"
                   [style.background-color]="color()">
              </div>
              <span class="text-[10px] text-gray-500 dark:text-gray-400 mt-1 truncate w-full text-center"
                    data-testid="chart-label">
                {{ point.label }}
              </span>
            </div>
          }
        </div>
      </mat-card-content>
    </mat-card>
  `,
})
export class TrendChartComponent {
  readonly data = input.required<ChartDataPoint[]>();
  readonly maxValue = input.required<number>();
  readonly title = input.required<string>();
  readonly color = input.required<string>();

  getBarHeight(value: number): number {
    const max = this.maxValue();
    if (max <= 0) return 0;
    return Math.round((value / max) * 100);
  }
}
