import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import type { CalendarEvent } from '../../data/models/calendar-event.model';
import type { TimeBlock } from '../../data/models/time-block.model';

const HOUR_START = 8;
const HOUR_END = 20;
const TOTAL_HOURS = HOUR_END - HOUR_START;

@Component({
  selector: 'app-time-block-column',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <div data-testid="time-column" class="relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
         [style.height.px]="TOTAL_HOURS * 60">
      <!-- Hour lines -->
      @for (hour of hours; track hour) {
        <div class="absolute w-full border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 pl-1"
             [style.top.px]="(hour - HOUR_START) * 60">
          {{ hour }}:00
        </div>
      }

      <!-- Existing calendar events (gray, read-only) -->
      @for (event of events(); track event.id) {
        <div data-testid="existing-event"
             class="absolute left-12 right-2 rounded px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 opacity-70 overflow-hidden"
             [style.top.px]="getTopOffset(event.start)"
             [style.height.px]="getHeight(event.start, event.end)"
             [matTooltip]="event.summary">
          {{ event.summary }}
        </div>
      }

      <!-- Time blocks (blue, editable) -->
      @for (block of timeBlocks(); track block.id) {
        <div data-testid="time-block"
             class="absolute left-12 right-2 rounded px-2 py-1 text-xs bg-blue-500 text-white cursor-pointer group overflow-hidden"
             [style.top.px]="getTopOffset(block.start)"
             [style.height.px]="getHeight(block.start, block.end)">
          <div class="flex items-center justify-between">
            <span class="truncate">{{ block.title }}</span>
            <button mat-icon-button
                    class="!w-5 !h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                    (click)="removeBlock.emit(block.id)"
                    aria-label="Remove time block">
              <mat-icon class="!text-xs !w-3 !h-3">close</mat-icon>
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class TimeBlockColumnComponent {
  readonly events = input.required<CalendarEvent[]>();
  readonly timeBlocks = input.required<TimeBlock[]>();
  readonly removeBlock = output<string>();

  protected readonly HOUR_START = HOUR_START;
  protected readonly TOTAL_HOURS = TOTAL_HOURS;
  protected readonly hours = Array.from(
    { length: TOTAL_HOURS },
    (_, i) => HOUR_START + i,
  );

  protected getTopOffset(isoTime: string): number {
    const date = new Date(isoTime);
    const hours = date.getHours() + date.getMinutes() / 60;
    return Math.max(0, (hours - HOUR_START) * 60);
  }

  protected getHeight(start: string, end: string): number {
    const startMs = new Date(start).getTime();
    const endMs = new Date(end).getTime();
    const minutes = (endMs - startMs) / 60000;
    return Math.max(20, minutes); // minimum 20px height
  }
}
