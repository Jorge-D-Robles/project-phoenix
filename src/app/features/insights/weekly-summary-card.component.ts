import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import type { WeekSummary } from '../../state/insights.store';

interface StatItem {
  readonly icon: string;
  readonly label: string;
  readonly value: number;
  readonly suffix: string;
}

@Component({
  selector: 'app-weekly-summary-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatIconModule],
  template: `
    <mat-card class="h-full">
      <mat-card-content class="p-4">
        <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
          This Week
        </h3>
        <div class="grid grid-cols-2 gap-4">
          @for (stat of stats(); track stat.label) {
            <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                 data-testid="stat-card">
              <mat-icon class="text-primary !text-2xl !w-6 !h-6">{{ stat.icon }}</mat-icon>
              <div class="flex flex-col">
                <span class="text-lg font-bold">{{ stat.value }}{{ stat.suffix }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">{{ stat.label }}</span>
              </div>
            </div>
          }
        </div>
      </mat-card-content>
    </mat-card>
  `,
})
export class WeeklySummaryCardComponent {
  readonly summary = input.required<WeekSummary>();

  readonly stats = computed<StatItem[]>(() => {
    const s = this.summary();
    return [
      { icon: 'task_alt', label: 'Tasks Done', value: s.tasksCompleted, suffix: '' },
      { icon: 'local_fire_department', label: 'Habits Logged', value: s.habitsLogged, suffix: '' },
      { icon: 'timer', label: 'Focus Time', value: s.focusMinutes, suffix: 'min' },
      { icon: 'event', label: 'Events', value: s.eventsAttended, suffix: '' },
    ];
  });
}
