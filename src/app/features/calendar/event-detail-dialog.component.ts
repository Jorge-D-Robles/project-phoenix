import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CalendarEvent } from '../../data/models/calendar-event.model';

@Component({
  selector: 'app-event-detail-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="min-w-[360px] max-w-md">
      <div class="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
        <div
          class="w-4 h-4 rounded-full shrink-0"
          [style.backgroundColor]="event.color.hex"
        ></div>
        <h2 class="text-lg font-semibold flex-1">{{ event.summary }}</h2>
        <button mat-icon-button mat-dialog-close aria-label="Close">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="flex flex-col gap-3 p-4">
        <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <mat-icon class="!text-xl !w-5 !h-5">schedule</mat-icon>
          @if (event.allDay) {
            <span>All day</span>
          } @else {
            <span>{{ event.start | date:'EEEE, MMM d, y, h:mm a' }} – {{ event.end | date:'h:mm a' }}</span>
          }
        </div>

        @if (event.location) {
          <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <mat-icon class="!text-xl !w-5 !h-5">location_on</mat-icon>
            <span>{{ event.location }}</span>
          </div>
        }

        @if (event.description) {
          <div class="mt-2 text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none"
               [innerHTML]="event.description">
          </div>
        }
      </div>

      @if (event.meetLink) {
        <div class="flex justify-start px-4 pb-2">
          <a mat-flat-button
             data-testid="join-meeting-btn"
             [href]="event.meetLink"
             target="_blank"
             rel="noopener noreferrer"
             class="!bg-blue-600 !text-white">
            <mat-icon>videocam</mat-icon>
            Join Meeting
          </a>
        </div>
      }

      @if (event.htmlLink) {
        <div class="flex justify-end p-4 pt-0">
          <a mat-stroked-button
             [href]="event.htmlLink"
             target="_blank"
             rel="noopener noreferrer">
            <mat-icon>open_in_new</mat-icon>
            Open in Google Calendar
          </a>
        </div>
      }
    </div>
  `,
})
export class EventDetailDialogComponent {
  protected readonly event: CalendarEvent = inject(MAT_DIALOG_DATA);
}
