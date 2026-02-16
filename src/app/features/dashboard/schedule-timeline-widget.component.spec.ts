import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ScheduleTimelineWidgetComponent } from './schedule-timeline-widget.component';
import type { CalendarEvent } from '../../data/models/calendar-event.model';

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: 'e1', summary: 'Team standup', description: null,
    start: '2026-02-16T09:00:00Z', end: '2026-02-16T09:30:00Z',
    allDay: false, colorId: '1', color: { name: 'Lavender', hex: '#7986CB' },
    location: 'Room A', htmlLink: null, status: 'confirmed',
    updatedDateTime: '2026-02-16T00:00:00Z',
  },
  {
    id: 'e2', summary: 'All day event', description: null,
    start: '2026-02-16', end: '2026-02-17',
    allDay: true, colorId: null, color: { name: 'Default', hex: '#4285F4' },
    location: null, htmlLink: null, status: 'confirmed',
    updatedDateTime: '2026-02-16T00:00:00Z',
  },
];

describe('ScheduleTimelineWidgetComponent', () => {
  async function setup(events: CalendarEvent[] = MOCK_EVENTS) {
    await TestBed.configureTestingModule({
      imports: [ScheduleTimelineWidgetComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    const fixture = TestBed.createComponent(ScheduleTimelineWidgetComponent);
    fixture.componentRef.setInput('events', events);
    await fixture.whenStable();
    return fixture;
  }

  afterEach(() => TestBed.resetTestingModule());

  describe('rendering', () => {
    it('should render the schedule card', async () => {
      const fixture = await setup();
      const card = fixture.debugElement.query(By.css('[data-testid="schedule-card"]'));
      expect(card).toBeTruthy();
    });

    it('should render event items for each event', async () => {
      const fixture = await setup();
      const items = fixture.debugElement.queryAll(By.css('[data-testid="event-item"]'));
      expect(items.length).toBe(2);
    });

    it('should display event summary', async () => {
      const fixture = await setup();
      const summaries = fixture.debugElement.queryAll(By.css('[data-testid="event-summary"]'));
      expect(summaries[0].nativeElement.textContent).toContain('Team standup');
    });

    it('should display event time', async () => {
      const fixture = await setup();
      const times = fixture.debugElement.queryAll(By.css('[data-testid="event-time"]'));
      expect(times[0].nativeElement.textContent.trim()).toBeTruthy();
    });

    it('should display All day for all-day events', async () => {
      const fixture = await setup();
      const times = fixture.debugElement.queryAll(By.css('[data-testid="event-time"]'));
      expect(times[1].nativeElement.textContent).toContain('All day');
    });

    it('should display location when available', async () => {
      const fixture = await setup();
      const locations = fixture.debugElement.queryAll(By.css('[data-testid="event-location"]'));
      expect(locations.length).toBe(1);
      expect(locations[0].nativeElement.textContent).toContain('Room A');
    });

    it('should show empty state when no events', async () => {
      const fixture = await setup([]);
      const empty = fixture.debugElement.query(By.css('[data-testid="empty-state"]'));
      expect(empty).toBeTruthy();
      expect(empty.nativeElement.textContent).toContain('No events today');
    });
  });
});
