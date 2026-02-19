import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { InsightsStore } from '../../state/insights.store';

@Component({
  selector: 'app-review-habits-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div data-testid="review-habits-step" class="flex flex-col gap-4">
      <h3 class="text-lg font-semibold">Habit Review</h3>
      <div class="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
        <p class="text-2xl font-bold text-purple-600 dark:text-purple-400" data-testid="habit-consistency">
          {{ insightsStore.overallHabitConsistency() }}%
        </p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Overall Consistency</p>
      </div>
      <div class="flex flex-col gap-3 mt-2">
        @for (streak of insightsStore.habitStreaks(); track streak.habit.id) {
          <div data-testid="habit-streak-item" class="flex flex-col gap-1">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">{{ streak.habit.title }}</span>
              <span class="text-xs text-gray-500">
                {{ streak.currentStreak }}d streak
              </span>
            </div>
            <div class="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div class="h-full bg-purple-500 rounded-full transition-all"
                   [style.width.%]="streak.consistency"></div>
            </div>
            <div class="flex justify-between text-xs text-gray-400">
              <span>{{ streak.consistency }}% consistent</span>
              <span>Best: {{ streak.longestStreak }}d</span>
            </div>
          </div>
        } @empty {
          <p class="text-sm text-gray-500 text-center py-4">No active habits</p>
        }
      </div>
    </div>
  `,
})
export class ReviewHabitsStepComponent {
  protected readonly insightsStore = inject(InsightsStore);
}
