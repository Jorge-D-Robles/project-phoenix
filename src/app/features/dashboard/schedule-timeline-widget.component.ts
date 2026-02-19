import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import type { CalendarEvent } from '../../data/models/calendar-event.model';

@Component({
  selector: 'app-schedule-timeline-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card data-testid="schedule-card" class="h-full">
      <mat-card-header>
        <mat-card-title class="flex items-center gap-2 text-base">
          <mat-icon>calendar_today</mat-icon>
          Today's Schedule
        </mat-card-title>
      </mat-card-header>
      <mat-card-content class="mt-3">
        @if (events().length === 0) {
          <p data-testid="empty-state" class="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
            No events today
          </p>
        } @else {
          <div class="flex flex-col">
            @for (event of events(); track event.id) {
              <div
                data-testid="event-item"
                class="flex gap-3 py-2 border-l-2 pl-3 ml-2"
                [style.border-left-color]="event.color.hex"
              >
                <div class="flex flex-col min-w-0 flex-1">
                  <span data-testid="event-time" class="text-xs text-gray-500 dark:text-gray-400">
                    @if (event.allDay) {
                      All day
                    } @else {
                      {{ event.start | date:'HH:mm' }} - {{ event.end | date:'HH:mm' }}
                    }
                  </span>
                  <span data-testid="event-summary" class="text-sm font-medium truncate">
                    {{ event.summary }}
                  </span>
                  @if (event.location) {
                    <span data-testid="event-location" class="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                      <mat-icon class="!text-xs !w-3 !h-3">location_on</mat-icon>
                      {{ event.location }}
                    </span>
                  }
                </div>
                @if (event.meetLink) {
                  <a data-testid="join-btn"
                     class="shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                     [href]="event.meetLink"
                     target="_blank"
                     rel="noopener noreferrer">
                    <mat-icon class="!text-sm !w-4 !h-4">videocam</mat-icon>
                    Join
                  </a>
                }
              </div>
            }
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
})
export class ScheduleTimelineWidgetComponent {
  readonly events = input.required<CalendarEvent[]>();
}
