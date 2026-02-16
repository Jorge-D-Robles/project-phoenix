import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HabitsStore } from '../../state/habits.store';
import { HabitCardComponent } from './habit-card.component';
import { HeatmapComponent } from './heatmap.component';
import { HabitFrequency } from '../../data/models/habit.model';

@Component({
  selector: 'app-habits',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    HabitCardComponent,
    HeatmapComponent,
  ],
  template: `
    <div class="p-6 max-w-3xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Habits</h1>
      </div>

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
        <!-- Selected habit detail with heatmap -->
        @if (store.selectedHabit(); as selected) {
          <div class="mb-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700" data-testid="habit-detail">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-lg font-semibold">{{ selected.title }}</h2>
              <button mat-icon-button (click)="store.selectHabit(null)" aria-label="Close detail">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <app-heatmap [logs]="store.logsForSelectedHabit()" />
          </div>
        }

        <!-- Active habits list -->
        @if (store.activeHabits().length > 0) {
          <div class="flex flex-col gap-2 mb-6" data-testid="habit-list">
            @for (habit of store.activeHabits(); track habit.id) {
              <app-habit-card
                [habit]="habit"
                (log)="onLogToday($event)"
                (select)="store.selectHabit($event)"
              />
            }
          </div>
        } @else {
          <div data-testid="empty-state"
               class="text-center py-12 text-gray-400 dark:text-gray-500">
            <mat-icon class="!text-5xl !w-12 !h-12 mb-3">self_improvement</mat-icon>
            <p class="text-lg">No habits yet</p>
            <p class="text-sm mt-1">Create your first habit to start tracking</p>
          </div>
        }

        <!-- Add habit form -->
        <mat-expansion-panel data-testid="add-habit-panel">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <button mat-button data-testid="add-habit-btn">
                <mat-icon>add</mat-icon>
                Add Habit
              </button>
            </mat-panel-title>
          </mat-expansion-panel-header>

          <div class="flex flex-col gap-4 p-2">
            <mat-form-field appearance="outline">
              <mat-label>Title</mat-label>
              <input matInput [(ngModel)]="newTitle" data-testid="habit-title-input" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Frequency</mat-label>
              <mat-select [(ngModel)]="newFrequency" data-testid="habit-frequency-select">
                <mat-option value="DAILY">Daily</mat-option>
                <mat-option value="WEEKLY">Weekly</mat-option>
                <mat-option value="MONTHLY">Monthly</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Target Value</mat-label>
              <input matInput type="number" [(ngModel)]="newTarget" min="1" data-testid="habit-target-input" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Color</mat-label>
              <input matInput [(ngModel)]="newColor" placeholder="#4CAF50" data-testid="habit-color-input" />
            </mat-form-field>

            <button mat-flat-button color="primary" (click)="onAddHabit()" data-testid="submit-habit-btn">
              Create Habit
            </button>
          </div>
        </mat-expansion-panel>
      }
    </div>
  `,
})
export class HabitsComponent implements OnInit {
  protected readonly store = inject(HabitsStore);

  protected newTitle = '';
  protected newFrequency: HabitFrequency = 'DAILY';
  protected newTarget = 1;
  protected newColor = '#4CAF50';

  ngOnInit(): void {
    this.store.loadData();
  }

  protected onLogToday(habitId: string): void {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    this.store.logHabit(habitId, today, 1);
  }

  protected onAddHabit(): void {
    if (!this.newTitle.trim()) return;
    this.store.addHabit({
      title: this.newTitle.trim(),
      frequency: this.newFrequency,
      targetValue: this.newTarget,
      color: this.newColor,
      archived: false,
    });
    this.newTitle = '';
    this.newFrequency = 'DAILY';
    this.newTarget = 1;
    this.newColor = '#4CAF50';
  }
}
