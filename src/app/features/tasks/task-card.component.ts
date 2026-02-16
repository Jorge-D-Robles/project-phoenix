import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { Task } from '../../data/models/task.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatCheckboxModule, MatIconModule, MatIconButton],
  template: `
    <div class="flex items-start gap-3 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700
                hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
      <mat-checkbox
        [checked]="isCompleted()"
        (change)="toggle.emit(task().id)"
        class="mt-0.5"
      />

      <div
        class="flex-1 min-w-0 cursor-pointer"
        data-testid="task-card-body"
        (click)="edit.emit(task().id)"
      >
        @if (task().parent) {
          <div data-testid="subtask-indicator"
               class="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mb-0.5">
            <mat-icon class="!text-sm !w-4 !h-4">subdirectory_arrow_right</mat-icon>
            <span>Subtask</span>
          </div>
        }

        <span
          data-testid="task-title"
          class="block text-sm font-medium"
          [class.line-through]="isCompleted()"
          [class.text-gray-400]="isCompleted()"
          [class.dark:text-gray-500]="isCompleted()"
        >
          {{ task().title }}
        </span>

        @if (task().notes) {
          <p data-testid="task-notes"
             class="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">
            {{ task().notes }}
          </p>
        }

        @if (task().dueDateTime) {
          <span data-testid="task-due"
                class="inline-flex items-center gap-1 mt-1 text-xs text-gray-400 dark:text-gray-500">
            <mat-icon class="!text-sm !w-4 !h-4">schedule</mat-icon>
            {{ task().dueDateTime | date:'mediumDate' }}
          </span>
        }
      </div>

      <button mat-icon-button
              data-testid="task-delete"
              class="opacity-0 group-hover:opacity-100 transition-opacity !w-8 !h-8"
              (click)="$event.stopPropagation(); delete.emit(task().id)"
              aria-label="Delete task">
        <mat-icon class="!text-lg">delete_outline</mat-icon>
      </button>
    </div>
  `,
})
export class TaskCardComponent {
  task = input.required<Task>();

  toggle = output<string>();
  edit = output<string>();
  delete = output<string>();

  isCompleted = computed(() => this.task().status === 'completed');
}
