import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import type { HabitStreakInfo } from '../../state/insights.store';

@Component({
  selector: 'app-habit-streaks-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatIconModule, MatProgressBarModule],
  template: `
    <mat-card class="h-full">
      <mat-card-content class="p-4">
        <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
          Habit Streaks
        </h3>

        @if (streaks().length === 0) {
          <p class="text-gray-400 dark:text-gray-500 text-sm text-center py-4">
            No active habits
          </p>
        } @else {
          <div class="flex flex-col gap-3">
            @for (streak of streaks(); track streak.habit.id) {
              <div class="flex items-center gap-3" data-testid="streak-row">
                <div class="w-3 h-3 rounded-full flex-shrink-0"
                     [style.background-color]="streak.habit.color">
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm font-medium truncate" data-testid="habit-title">
                      {{ streak.habit.title }}
                    </span>
                    <div class="flex items-center gap-1 flex-shrink-0">
                      <mat-icon class="text-orange-500 !text-base !w-4 !h-4">local_fire_department</mat-icon>
                      <span class="text-sm font-semibold" data-testid="current-streak">
                        {{ streak.currentStreak }}
                      </span>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <mat-progress-bar
                      mode="determinate"
                      [value]="streak.consistency"
                      class="flex-1">
                    </mat-progress-bar>
                    <span class="text-xs text-gray-500 dark:text-gray-400 w-8 text-right"
                          data-testid="consistency">
                      {{ streak.consistency }}%
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
})
export class HabitStreaksWidgetComponent {
  streaks = input.required<HabitStreakInfo[]>();
}
