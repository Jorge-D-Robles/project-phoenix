import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import type { HabitStatusEntry } from '../../state/dashboard.store';

@Component({
  selector: 'app-habit-status-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <mat-card data-testid="habit-status-card" class="h-full">
      <mat-card-header>
        <mat-card-title class="flex items-center gap-2 text-base">
          <mat-icon>emoji_events</mat-icon>
          Habits
        </mat-card-title>
      </mat-card-header>
      <mat-card-content class="mt-3">
        @if (habits().length === 0) {
          <p data-testid="empty-state" class="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
            No active habits
          </p>
        } @else {
          <div class="flex flex-col gap-2">
            @for (entry of habits(); track entry.habit.id) {
              <div
                data-testid="habit-item"
                class="flex items-center gap-3 py-1"
              >
                <div
                  data-testid="habit-color"
                  class="w-3 h-3 rounded-full shrink-0"
                  [style.backgroundColor]="entry.habit.color"
                ></div>
                <span data-testid="habit-title" class="text-sm flex-1 truncate">
                  {{ entry.habit.title }}
                </span>
                @if (entry.loggedToday) {
                  <mat-icon data-testid="habit-done" class="text-green-500 !w-5 !h-5 !text-xl">check_circle</mat-icon>
                } @else {
                  <button
                    mat-icon-button
                    data-testid="habit-log-btn"
                    class="!w-8 !h-8"
                    aria-label="Log habit"
                    (click)="logHabit.emit(entry.habit.id)"
                  >
                    <mat-icon class="!text-xl !w-5 !h-5 text-gray-400">radio_button_unchecked</mat-icon>
                  </button>
                }
              </div>
            }
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
})
export class HabitStatusWidgetComponent {
  readonly habits = input.required<HabitStatusEntry[]>();
  readonly logHabit = output<string>();
}
