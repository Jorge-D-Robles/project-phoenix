import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { InsightsStore } from '../../state/insights.store';

@Component({
  selector: 'app-review-calendar-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div data-testid="review-calendar-step" class="flex flex-col gap-4">
      <h3 class="text-lg font-semibold">Calendar Review</h3>
      <div class="grid grid-cols-2 gap-4">
        <div class="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <p class="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="events-attended">
            {{ insightsStore.weekSummary().eventsAttended }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">Events This Week</p>
        </div>
        <div class="p-4 rounded-lg bg-teal-50 dark:bg-teal-900/20">
          <p class="text-2xl font-bold text-teal-600 dark:text-teal-400" data-testid="focus-minutes">
            {{ insightsStore.weekSummary().focusMinutes }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">Focus Minutes</p>
        </div>
      </div>
      <div class="flex flex-col gap-2 mt-2">
        <h4 class="text-sm font-medium text-gray-500">Events Per Day (Last 7 Days)</h4>
        @for (day of insightsStore.eventsByDay().slice(-7); track day.date) {
          <div class="flex items-center gap-2 text-sm">
            <span class="w-24 text-gray-500">{{ day.date }}</span>
            <div class="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div class="h-full bg-blue-500 rounded-full"
                   [style.width.%]="day.count > 0 ? Math.min(100, day.count * 15) : 0"></div>
            </div>
            <span class="w-8 text-right text-gray-600 dark:text-gray-400">{{ day.count }}</span>
          </div>
        }
      </div>
    </div>
  `,
})
export class ReviewCalendarStepComponent {
  protected readonly insightsStore = inject(InsightsStore);
  protected readonly Math = Math;
}
