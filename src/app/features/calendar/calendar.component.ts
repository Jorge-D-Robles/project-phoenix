import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CalendarStore } from '../../state/calendar.store';
import { EventCardComponent } from './event-card.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    EventCardComponent,
  ],
  template: `
    <div class="p-6 max-w-3xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Schedule</h1>
      </div>

      <!-- Date navigation -->
      <div class="flex items-center gap-2 mb-4">
        <button mat-icon-button
                data-testid="prev-day"
                (click)="onPrevDay()"
                aria-label="Previous day">
          <mat-icon>chevron_left</mat-icon>
        </button>

        <span data-testid="selected-date" class="text-lg font-medium min-w-[180px] text-center">
          {{ selectedDateDisplay() | date:'EEEE, MMM d, y' }}
        </span>

        <button mat-icon-button
                data-testid="next-day"
                (click)="onNextDay()"
                aria-label="Next day">
          <mat-icon>chevron_right</mat-icon>
        </button>

        <button mat-stroked-button
                data-testid="today-btn"
                class="ml-2"
                (click)="onToday()">
          Today
        </button>
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
        <!-- Events for selected day -->
        @if (store.eventsForSelectedDate().length > 0) {
          <div class="flex flex-col gap-2" data-testid="event-list">
            @for (event of store.eventsForSelectedDate(); track event.id) {
              <app-event-card [event]="event" />
            }
          </div>
        } @else {
          <div data-testid="empty-state"
               class="text-center py-12 text-gray-400 dark:text-gray-500">
            <mat-icon class="!text-5xl !w-12 !h-12 mb-3">event_busy</mat-icon>
            <p class="text-lg">No events</p>
            <p class="text-sm mt-1">Nothing scheduled for this day</p>
          </div>
        }
      }
    </div>
  `,
})
export class CalendarComponent implements OnInit {
  protected readonly store = inject(CalendarStore);

  ngOnInit(): void {
    this.store.initialSync();
  }

  protected selectedDateDisplay(): string {
    // Return an ISO string the DatePipe can parse
    return this.store.selectedDate() + 'T00:00:00';
  }

  protected onPrevDay(): void {
    this.store.selectDate(this.offsetDate(-1));
  }

  protected onNextDay(): void {
    this.store.selectDate(this.offsetDate(1));
  }

  protected onToday(): void {
    this.store.selectDate(new Date().toISOString().split('T')[0]);
  }

  private offsetDate(days: number): string {
    const current = new Date(this.store.selectedDate() + 'T00:00:00');
    current.setDate(current.getDate() + days);
    return current.toISOString().split('T')[0];
  }
}
