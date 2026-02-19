import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { InsightsStore } from '../../state/insights.store';
import { TasksStore } from '../../state/tasks.store';

@Component({
  selector: 'app-review-tasks-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div data-testid="review-tasks-step" class="flex flex-col gap-4">
      <h3 class="text-lg font-semibold">Task Review</h3>
      <div class="grid grid-cols-2 gap-4">
        <div class="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
          <p class="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="tasks-completed">
            {{ insightsStore.weekSummary().tasksCompleted }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</p>
        </div>
        <div class="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
          <p class="text-2xl font-bold text-orange-600 dark:text-orange-400" data-testid="tasks-pending">
            {{ pendingCount() }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">Still Pending</p>
        </div>
      </div>
      <div class="flex flex-col gap-2 mt-2">
        <h4 class="text-sm font-medium text-gray-500">Recent Completions</h4>
        @for (day of insightsStore.taskCompletionByDay().slice(-7); track day.date) {
          <div class="flex items-center gap-2 text-sm">
            <span class="w-24 text-gray-500">{{ day.date }}</span>
            <div class="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div class="h-full bg-green-500 rounded-full"
                   [style.width.%]="day.count > 0 ? Math.min(100, day.count * 20) : 0"></div>
            </div>
            <span class="w-8 text-right text-gray-600 dark:text-gray-400">{{ day.count }}</span>
          </div>
        }
      </div>
    </div>
  `,
})
export class ReviewTasksStepComponent {
  protected readonly insightsStore = inject(InsightsStore);
  private readonly tasksStore = inject(TasksStore);
  protected readonly Math = Math;

  protected readonly pendingCount = () =>
    this.tasksStore.tasks().filter(t => t.status === 'needsAction').length;
}
