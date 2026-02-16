import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { EventCardComponent } from './event-card.component';
import { CalendarEvent } from '../../data/models/calendar-event.model';

function makeEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: 'evt1',
    summary: 'Team Standup',
    description: 'Daily sync call',
    start: '2026-02-16T09:00:00Z',
    end: '2026-02-16T09:30:00Z',
    allDay: false,
    colorId: '7',
    color: { name: 'Peacock', hex: '#039BE5' },
    location: 'Room 42',
    htmlLink: 'https://calendar.google.com/event?eid=abc',
    status: 'confirmed',
    updatedDateTime: '2026-02-15T12:00:00Z',
    ...overrides,
  };
}

describe('EventCardComponent', () => {
  async function setup(event: CalendarEvent = makeEvent()) {
    await TestBed.configureTestingModule({
      imports: [EventCardComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(EventCardComponent);
    fixture.componentRef.setInput('event', event);
    await fixture.whenStable();
    return fixture;
  }

  afterEach(() => TestBed.resetTestingModule());

  describe('rendering', () => {
    it('should display the event summary', async () => {
      const fixture = await setup();
      const title = fixture.debugElement.query(By.css('[data-testid="event-summary"]'));
      expect(title.nativeElement.textContent).toContain('Team Standup');
    });

    it('should display the time range for timed events', async () => {
      const fixture = await setup();
      const time = fixture.debugElement.query(By.css('[data-testid="event-time"]'));
      expect(time).toBeTruthy();
      expect(time.nativeElement.textContent).toBeTruthy();
    });

    it('should display "All day" for all-day events', async () => {
      const fixture = await setup(makeEvent({
        allDay: true,
        start: '2026-02-16',
        end: '2026-02-17',
      }));
      const time = fixture.debugElement.query(By.css('[data-testid="event-time"]'));
      expect(time.nativeElement.textContent).toContain('All day');
    });

    it('should display the event location when present', async () => {
      const fixture = await setup();
      const loc = fixture.debugElement.query(By.css('[data-testid="event-location"]'));
      expect(loc).toBeTruthy();
      expect(loc.nativeElement.textContent).toContain('Room 42');
    });

    it('should not display location when absent', async () => {
      const fixture = await setup(makeEvent({ location: null }));
      const loc = fixture.debugElement.query(By.css('[data-testid="event-location"]'));
      expect(loc).toBeNull();
    });

    it('should apply the event color as a left border', async () => {
      const fixture = await setup();
      const card = fixture.debugElement.query(By.css('[data-testid="event-card"]'));
      expect(card.nativeElement.style.borderLeftColor).toBe('rgb(3, 155, 229)'); // #039BE5
    });
  });
});
