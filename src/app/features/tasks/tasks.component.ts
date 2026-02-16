import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { TasksStore } from '../../state/tasks.store';
import { TaskCardComponent } from './task-card.component';
import { TaskDetailDialogComponent } from './task-detail-dialog.component';
import { Task, TaskFilter } from '../../data/models/task.model';

@Component({
  selector: 'app-tasks',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatSelectModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    CdkDropList,
    CdkDrag,
    TaskCardComponent,
  ],
  template: `
    <div class="p-6 max-w-3xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Tasks</h1>

        <mat-form-field data-testid="list-selector" class="w-48" subscriptSizing="dynamic">
          <mat-select
            [value]="store.selectedListId()"
            (selectionChange)="onListChange($event.value)"
            placeholder="Select list"
          >
            @for (list of store.taskLists(); track list.id) {
              <mat-option [value]="list.id">{{ list.title }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Filter tabs -->
      <mat-button-toggle-group
        class="mb-4"
        [value]="store.filter()"
        (change)="store.setFilter($event.value)"
      >
        @for (f of filters; track f.value) {
          <mat-button-toggle
            data-testid="filter-tab"
            [value]="f.value"
          >
            {{ f.label }}
          </mat-button-toggle>
        }
      </mat-button-toggle-group>

      <!-- Error state -->
      @if (store.error(); as error) {
        <div data-testid="error-message"
             class="p-4 mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
          {{ error }}
        </div>
      }

      <!-- Loading state -->
      @if (store.loading()) {
        <div class="flex justify-center py-12">
          <mat-spinner diameter="40" />
        </div>
      } @else {
        <!-- Task list -->
        @if (store.filteredTasks().length > 0) {
          <div class="flex flex-col gap-2"
               cdkDropList
               data-testid="task-list"
               (cdkDropListDropped)="onDrop($event)">
            @for (task of store.filteredTasks(); track task.id) {
              <app-task-card
                cdkDrag
                [task]="task"
                (toggle)="store.toggleTaskStatus($event)"
                (edit)="onEditTask($event)"
                (delete)="store.removeTask($event)"
              />
            }
          </div>
        } @else {
          <div data-testid="empty-state"
               class="text-center py-12 text-gray-400 dark:text-gray-500">
            <mat-icon class="!text-5xl !w-12 !h-12 mb-3">task_alt</mat-icon>
            <p class="text-lg">No tasks yet</p>
            <p class="text-sm mt-1">Create a task to get started</p>
          </div>
        }
      }

      <!-- FAB -->
      <button mat-fab
              data-testid="add-task-fab"
              class="!fixed bottom-6 right-6"
              color="primary"
              (click)="onAddTask()"
              aria-label="Add task">
        <mat-icon>add</mat-icon>
      </button>
    </div>
  `,
})
export class TasksComponent implements OnInit {
  protected readonly store = inject(TasksStore);
  private readonly dialog = inject(MatDialog);

  protected readonly filters: { label: string; value: TaskFilter }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Active', value: 'needsAction' },
    { label: 'Completed', value: 'completed' },
  ];

  ngOnInit(): void {
    this.store.loadTaskLists().then(() => {
      const lists = this.store.taskLists();
      if (lists.length > 0 && !this.store.selectedListId()) {
        this.store.loadTasks(lists[0].id);
      }
    });
  }

  protected onListChange(listId: string): void {
    this.store.loadTasks(listId);
  }

  protected onAddTask(): void {
    const dialogRef = this.dialog.open(TaskDetailDialogComponent, {
      width: '480px',
      data: { mode: 'create' },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.addTask(result);
      }
    });
  }

  protected onDrop(event: CdkDragDrop<Task[]>): void {
    if (event.previousIndex === event.currentIndex) return;

    const tasks = [...this.store.filteredTasks()];
    moveItemInArray(tasks, event.previousIndex, event.currentIndex);

    const movedTaskId = tasks[event.currentIndex].id;
    const previous = event.currentIndex > 0 ? tasks[event.currentIndex - 1].id : undefined;

    this.store.moveTask(movedTaskId, previous ? { previous } : {});
  }

  protected onEditTask(taskId: string): void {
    const task = this.store.tasks().find(t => t.id === taskId);
    if (!task) return;
    const dialogRef = this.dialog.open(TaskDetailDialogComponent, {
      width: '480px',
      data: { mode: 'edit', task },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.updateTask(taskId, result);
      }
    });
  }
}
