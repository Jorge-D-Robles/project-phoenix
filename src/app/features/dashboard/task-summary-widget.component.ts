import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import type { Task } from '../../data/models/task.model';

@Component({
  selector: 'app-task-summary-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatCheckboxModule, MatIconModule],
  template: `
    <mat-card data-testid="task-summary-card" class="h-full">
      <mat-card-header>
        <mat-card-title class="flex items-center gap-2 text-base">
          <mat-icon>check_circle</mat-icon>
          Today's Tasks
        </mat-card-title>
      </mat-card-header>
      <mat-card-content class="mt-3">
        @if (tasks().length === 0) {
          <p data-testid="empty-state" class="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
            No tasks due today
          </p>
        } @else {
          <div class="flex flex-col gap-2">
            @for (task of tasks(); track task.id) {
              <div
                data-testid="task-item"
                class="flex items-center gap-2 py-1"
              >
                <mat-checkbox
                  data-testid="task-checkbox"
                  [checked]="task.status === 'completed'"
                  (change)="toggle.emit(task.id)"
                />
                <span
                  data-testid="task-title"
                  class="text-sm"
                  [class.line-through]="task.status === 'completed'"
                  [class.text-gray-400]="task.status === 'completed'"
                >
                  {{ task.title }}
                </span>
              </div>
            }
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
})
export class TaskSummaryWidgetComponent {
  readonly tasks = input.required<Task[]>();
  readonly toggle = output<string>();
}
