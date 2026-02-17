import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { Task } from '../../data/models/task.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatCheckboxModule, MatChipsModule, MatIconModule, MatIconButton],
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
          <mat-chip-set class="mt-1">
            <mat-chip data-testid="task-due"
                      class="!text-xs !min-h-[24px] !px-2"
                      [class.!bg-red-100]="dueStatus() === 'overdue'"
                      [class.!text-red-700]="dueStatus() === 'overdue'"
                      [class.dark:!bg-red-900]="dueStatus() === 'overdue'"
                      [class.dark:!text-red-300]="dueStatus() === 'overdue'"
                      [class.!bg-orange-100]="dueStatus() === 'today'"
                      [class.!text-orange-700]="dueStatus() === 'today'"
                      [class.dark:!bg-orange-900]="dueStatus() === 'today'"
                      [class.dark:!text-orange-300]="dueStatus() === 'today'"
                      [class.!bg-gray-100]="dueStatus() === 'upcoming'"
                      [class.!text-gray-600]="dueStatus() === 'upcoming'"
                      [class.dark:!bg-gray-800]="dueStatus() === 'upcoming'"
                      [class.dark:!text-gray-400]="dueStatus() === 'upcoming'"
                      [highlighted]="dueStatus() === 'overdue' || dueStatus() === 'today'">
              <mat-icon class="!text-sm !w-4 !h-4 mr-0.5">schedule</mat-icon>
              @if (dueStatus() === 'overdue') {
                Overdue
              } @else if (dueStatus() === 'today') {
                Due today
              } @else {
                {{ task().dueDateTime | date:'mediumDate' }}
              }
            </mat-chip>
          </mat-chip-set>
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
  readonly task = input.required<Task>();

  readonly toggle = output<string>();
  readonly edit = output<string>();
  readonly delete = output<string>();

  protected readonly isCompleted = computed(() => this.task().status === 'completed');

  protected readonly dueStatus = computed((): 'overdue' | 'today' | 'upcoming' | null => {
    const due = this.task().dueDateTime;
    if (!due) return null;
    const today = new Date().toISOString().split('T')[0];
    const dueDate = due.substring(0, 10);
    if (dueDate < today) return 'overdue';
    if (dueDate === today) return 'today';
    return 'upcoming';
  });
}
