import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { InsightsStore } from '../../state/insights.store';

@Component({
  selector: 'app-review-summary-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div data-testid="review-summary-step" class="flex flex-col gap-4">
      <h3 class="text-lg font-semibold">Weekly Summary</h3>

      <div class="flex items-center justify-center p-6">
        <div class="relative w-32 h-32">
          <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#e5e7eb" stroke-width="3" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#8b5cf6" stroke-width="3"
                  [attr.stroke-dasharray]="insightsStore.productivityScore() + ', 100'" />
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-3xl font-bold" data-testid="score">{{ insightsStore.productivityScore() }}</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-center">
          <p class="text-xl font-bold" data-testid="summary-tasks">{{ summary().tasksCompleted }}</p>
          <p class="text-xs text-gray-500">Tasks Done</p>
        </div>
        <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-center">
          <p class="text-xl font-bold" data-testid="summary-habits">{{ summary().habitsLogged }}</p>
          <p class="text-xs text-gray-500">Habits Logged</p>
        </div>
        <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-center">
          <p class="text-xl font-bold" data-testid="summary-focus">{{ summary().focusMinutes }}m</p>
          <p class="text-xs text-gray-500">Focus Time</p>
        </div>
        <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-center">
          <p class="text-xl font-bold" data-testid="summary-events">{{ summary().eventsAttended }}</p>
          <p class="text-xs text-gray-500">Events</p>
        </div>
      </div>
    </div>
  `,
})
export class ReviewSummaryStepComponent {
  protected readonly insightsStore = inject(InsightsStore);
  protected readonly summary = this.insightsStore.weekSummary;
}
