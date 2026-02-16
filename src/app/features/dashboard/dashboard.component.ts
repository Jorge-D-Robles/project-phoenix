import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DashboardStore } from '../../state/dashboard.store';
import { TasksStore } from '../../state/tasks.store';
import { HabitsStore } from '../../state/habits.store';
import { GreetingHeaderComponent } from './greeting-header.component';
import { TaskSummaryWidgetComponent } from './task-summary-widget.component';
import { ScheduleTimelineWidgetComponent } from './schedule-timeline-widget.component';
import { HabitStatusWidgetComponent } from './habit-status-widget.component';
import { RecentNotesWidgetComponent } from './recent-notes-widget.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    GreetingHeaderComponent,
    TaskSummaryWidgetComponent,
    ScheduleTimelineWidgetComponent,
    HabitStatusWidgetComponent,
    RecentNotesWidgetComponent,
  ],
  template: `
    <div class="p-6 max-w-6xl mx-auto flex flex-col gap-6">
      <app-greeting-header
        [greeting]="dashboardStore.greeting()"
        [date]="todayFormatted()"
        [summary]="dashboardStore.completionSummary()"
      />

      <div data-testid="dashboard-grid"
           class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <app-task-summary-widget
          [tasks]="dashboardStore.todayTasks()"
          (toggle)="onToggleTask($event)"
        />
        <app-schedule-timeline-widget
          [events]="dashboardStore.todayEvents()"
        />
        <app-habit-status-widget
          [habits]="dashboardStore.habitStatus()"
          (logHabit)="onLogHabit($event)"
        />
        <app-recent-notes-widget
          [notes]="dashboardStore.recentNotes()"
        />
      </div>
    </div>
  `,
})
export class DashboardComponent {
  protected readonly dashboardStore = inject(DashboardStore);
  private readonly tasksStore = inject(TasksStore);
  private readonly habitsStore = inject(HabitsStore);

  protected readonly todayFormatted = computed(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });

  constructor() {
    this.dashboardStore.loadAll();
  }

  protected onToggleTask(taskId: string): void {
    this.tasksStore.toggleTaskStatus(taskId);
  }

  protected onLogHabit(habitId: string): void {
    const today = new Date().toISOString().split('T')[0];
    this.habitsStore.logHabit(habitId, today, 1);
  }
}
