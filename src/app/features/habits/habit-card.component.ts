import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Habit } from '../../data/models/habit.model';

@Component({
  selector: 'app-habit-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatChipsModule, MatIconModule],
  template: `
    <div
      data-testid="habit-card"
      class="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700
             transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
      (click)="select.emit(habit().id)"
    >
      <div
        data-testid="habit-color"
        class="w-3 h-3 rounded-full shrink-0"
        [style.backgroundColor]="habit().color"
      ></div>

      <div class="flex flex-col flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span data-testid="habit-title" class="text-sm font-medium truncate">
            {{ habit().title }}
          </span>
          @if (streak() > 0) {
            <mat-chip-set>
              <mat-chip data-testid="streak-badge"
                        class="!text-xs !min-h-[22px] !px-2 !bg-orange-100 !text-orange-700
                               dark:!bg-orange-900 dark:!text-orange-300"
                        highlighted>
                <mat-icon class="!text-sm !w-4 !h-4 mr-0.5">local_fire_department</mat-icon>
                {{ streak() }}-day streak
              </mat-chip>
            </mat-chip-set>
          }
        </div>
        <span
          data-testid="habit-frequency"
          class="text-xs text-gray-500 dark:text-gray-400"
        >
          {{ habit().frequency }}
        </span>
      </div>

      <button
        mat-icon-button
        data-testid="log-btn"
        aria-label="Log today"
        (click)="onLog($event)"
      >
        <mat-icon>add_circle</mat-icon>
      </button>
    </div>
  `,
})
export class HabitCardComponent {
  habit = input.required<Habit>();
  streak = input<number>(0);

  log = output<string>();
  select = output<string>();

  protected onLog(event: Event): void {
    event.stopPropagation();
    this.log.emit(this.habit().id);
  }
}
