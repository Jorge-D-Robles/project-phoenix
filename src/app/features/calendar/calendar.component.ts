import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DatesSetArg, EventClickArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarStore, CalendarViewMode } from '../../state/calendar.store';
import { CalendarEvent } from '../../data/models/calendar-event.model';
import { EventDetailDialogComponent } from './event-detail-dialog.component';

interface ViewOption {
  label: string;
  value: CalendarViewMode;
  icon: string;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatProgressSpinnerModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    FullCalendarModule,
  ],
  styleUrl: './calendar-theme.css',
  template: `
    <div class="p-6 max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <button mat-icon-button
                  data-testid="prev-btn"
                  (click)="onPrev()"
                  aria-label="Previous">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <button mat-icon-button
                  data-testid="next-btn"
                  (click)="onNext()"
                  aria-label="Next">
            <mat-icon>chevron_right</mat-icon>
          </button>
          <button mat-stroked-button
                  data-testid="today-btn"
                  (click)="onToday()">
            Today
          </button>
          <h1 data-testid="calendar-title" class="text-xl font-semibold ml-2">
            {{ title() }}
          </h1>
        </div>

        <mat-button-toggle-group
          data-testid="view-toggle"
          [value]="store.viewMode()"
          (change)="onViewChange($event.value)"
        >
          @for (view of viewOptions; track view.value) {
            <mat-button-toggle [value]="view.value">
              {{ view.label }}
            </mat-button-toggle>
          }
        </mat-button-toggle-group>
      </div>

      <!-- Error state -->
      @if (store.error(); as error) {
        <div data-testid="error-message"
             class="p-4 mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
          {{ error }}
        </div>
      }

      <!-- Loading overlay -->
      @if (store.loading()) {
        <div class="flex justify-center py-12">
          <mat-spinner diameter="40" />
        </div>
      }

      <!-- FullCalendar -->
      <div [class.opacity-50]="store.loading()" [class.pointer-events-none]="store.loading()">
        <full-calendar
          data-testid="full-calendar"
          [options]="calendarOptions()"
        />
      </div>
    </div>
  `,
})
export class CalendarComponent implements OnInit {
  protected readonly store = inject(CalendarStore);
  private readonly dialog = inject(MatDialog);

  private readonly calendarRef = viewChild(FullCalendarComponent);

  protected readonly title = signal('');

  protected readonly viewOptions: ViewOption[] = [
    { label: 'Day', value: 'timeGridDay', icon: 'view_day' },
    { label: '3-Day', value: 'timeGrid3Day', icon: 'view_column' },
    { label: 'Week', value: 'timeGridWeek', icon: 'view_week' },
    { label: 'Month', value: 'dayGridMonth', icon: 'calendar_view_month' },
  ];

  protected readonly fcEvents = computed<EventInput[]>(() => {
    return this.store.eventsForRange().map(event => ({
      id: event.id,
      title: event.summary,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      backgroundColor: event.color.hex,
      borderColor: event.color.hex,
      textColor: '#fff',
      extendedProps: { phoenixEvent: event },
    }));
  });

  protected readonly calendarOptions = computed<CalendarOptions>(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView: this.store.viewMode(),
    headerToolbar: false,
    events: this.fcEvents(),
    height: 'auto',
    nowIndicator: true,
    selectable: false,
    editable: false,
    dayMaxEvents: true,
    views: {
      timeGrid3Day: {
        type: 'timeGrid',
        duration: { days: 3 },
        buttonText: '3-Day',
      },
    },
    eventClick: (info: EventClickArg) => this.onEventClick(info),
    datesSet: (arg: DatesSetArg) => this.onDatesSet(arg),
    slotMinTime: '06:00:00',
    slotMaxTime: '22:00:00',
    expandRows: true,
    stickyHeaderDates: true,
    allDaySlot: true,
  }));

  ngOnInit(): void {
    this.store.initialSync();
  }

  protected onPrev(): void {
    this.calendarRef()?.getApi()?.prev();
  }

  protected onNext(): void {
    this.calendarRef()?.getApi()?.next();
  }

  protected onToday(): void {
    this.calendarRef()?.getApi()?.today();
  }

  protected onViewChange(mode: CalendarViewMode): void {
    this.store.setViewMode(mode);
    const api = this.calendarRef()?.getApi();
    if (api) {
      api.changeView(mode);
    }
  }

  private onEventClick(info: EventClickArg): void {
    info.jsEvent.preventDefault();
    const phoenixEvent: CalendarEvent = info.event.extendedProps['phoenixEvent'];
    if (phoenixEvent) {
      this.dialog.open(EventDetailDialogComponent, {
        data: phoenixEvent,
        width: '480px',
      });
    }
  }

  private onDatesSet(arg: DatesSetArg): void {
    this.title.set(arg.view.title);
    const start = arg.startStr.substring(0, 10);
    const end = arg.endStr.substring(0, 10);
    this.store.setDateRange(start, end);
    this.store.selectDate(arg.view.currentStart.toISOString().split('T')[0]);
  }
}
