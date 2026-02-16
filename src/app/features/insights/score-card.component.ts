import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-score-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatProgressBarModule],
  template: `
    <mat-card class="h-full">
      <mat-card-content class="flex flex-col items-center gap-2 p-6">
        <span class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide"
              data-testid="score-label">
          {{ label() }}
        </span>
        <span class="text-5xl font-bold"
              data-testid="score-value"
              [class]="scoreColorClass()">
          {{ score() }}
        </span>
        <mat-progress-bar
          mode="determinate"
          [value]="score()"
          [color]="progressColor()"
          class="w-full mt-2"
          data-testid="score-progress">
        </mat-progress-bar>
      </mat-card-content>
    </mat-card>
  `,
})
export class ScoreCardComponent {
  score = input.required<number>();
  label = input.required<string>();

  scoreColorClass = computed(() => {
    const s = this.score();
    if (s >= 70) return 'text-green-600 dark:text-green-400';
    if (s >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  });

  progressColor = computed<'primary' | 'accent' | 'warn'>(() => {
    const s = this.score();
    if (s >= 70) return 'primary';
    if (s >= 40) return 'accent';
    return 'warn';
  });
}
