import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { PlannerStore } from '../../state/planner.store';
import { TimeBlockColumnComponent } from './time-block-column.component';
import { toDateKey } from '../../shared/date.utils';
import type { Task } from '../../data/models/task.model';

@Component({
  selector: 'app-planner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatListModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TimeBlockColumnComponent,
  ],
  template: `
    <div class="p-6 max-w-6xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <mat-icon class="text-primary">view_timeline</mat-icon>
        <h1 class="text-2xl font-semibold">Planner</h1>
        <span class="flex-1"></span>
        <input type="date"
               data-testid="date-picker"
               class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm"
               [ngModel]="plannerStore.selectedDate()"
               (ngModelChange)="onDateChange($event)">
        <button mat-stroked-button (click)="goToToday()" data-testid="today-btn">
          Today
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
        <!-- Task list sidebar -->
        <mat-card data-testid="task-sidebar">
          <mat-card-header>
            <mat-card-title class="text-base">Unscheduled Tasks</mat-card-title>
          </mat-card-header>
          <mat-card-content class="mt-2">
            <mat-nav-list dense>
              @for (task of plannerStore.unscheduledTasks(); track task.id) {
                <a mat-list-item
                   data-testid="unscheduled-task"
                   (click)="scheduleTask(task)">
                  <mat-icon matListItemIcon>task_alt</mat-icon>
                  <span matListItemTitle class="truncate">{{ task.title }}</span>
                </a>
              } @empty {
                <p class="text-sm text-gray-500 text-center py-4">All tasks scheduled</p>
              }
            </mat-nav-list>
          </mat-card-content>
        </mat-card>

        <!-- Day timeline -->
        <mat-card data-testid="day-timeline">
          <mat-card-header>
            <mat-card-title class="text-base">
              {{ plannerStore.selectedDate() }}
            </mat-card-title>
          </mat-card-header>
          <mat-card-content class="mt-2">
            <app-time-block-column
              [events]="plannerStore.dayEvents()"
              [timeBlocks]="plannerStore.timeBlocks()"
              (removeBlock)="onRemoveBlock($event)"
            />
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
})
export class PlannerComponent {
  protected readonly plannerStore = inject(PlannerStore);
  private nextHour = 9;

  protected onDateChange(date: string): void {
    this.plannerStore.setDate(date);
    this.nextHour = 9;
  }

  protected goToToday(): void {
    this.plannerStore.setDate(toDateKey(new Date()));
    this.nextHour = 9;
  }

  protected scheduleTask(task: Task): void {
    const date = this.plannerStore.selectedDate();
    const startHour = String(this.nextHour).padStart(2, '0');
    const endHour = String(this.nextHour + 1).padStart(2, '0');
    const start = `${date}T${startHour}:00:00`;
    const end = `${date}T${endHour}:00:00`;

    this.plannerStore.createTimeBlock(task.title, start, end, task.id);
    this.nextHour = Math.min(this.nextHour + 1, 19);
  }

  protected onRemoveBlock(id: string): void {
    this.plannerStore.removeTimeBlock(id);
  }
}
