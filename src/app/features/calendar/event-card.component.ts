import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CalendarEvent } from '../../data/models/calendar-event.model';

@Component({
  selector: 'app-event-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatIconModule],
  template: `
    <div
      data-testid="event-card"
      class="flex flex-col gap-1 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700
             border-l-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
      [style.border-left-color]="event().color.hex"
    >
      <span data-testid="event-summary" class="text-sm font-medium">
        {{ event().summary }}
      </span>

      <span data-testid="event-time"
            class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
        <mat-icon class="!text-sm !w-4 !h-4">schedule</mat-icon>
        @if (event().allDay) {
          All day
        } @else {
          {{ event().start | date:'shortTime' }} – {{ event().end | date:'shortTime' }}
        }
      </span>

      @if (event().location) {
        <span data-testid="event-location"
              class="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
          <mat-icon class="!text-sm !w-4 !h-4">location_on</mat-icon>
          {{ event().location }}
        </span>
      }
    </div>
  `,
})
export class EventCardComponent {
  event = input.required<CalendarEvent>();
}
