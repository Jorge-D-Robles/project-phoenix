import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CalendarComponent } from './calendar.component';
import { CalendarStore, CalendarViewMode } from '../../state/calendar.store';
import { CalendarEvent } from '../../data/models/calendar-event.model';

function makeEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: 'evt1',
    summary: 'Team Standup',
    description: 'Daily sync',
    start: '2026-02-16T09:00:00Z',
    end: '2026-02-16T09:30:00Z',
    allDay: false,
    colorId: '7',
    color: { name: 'Peacock', hex: '#039BE5' },
    location: 'Room 42',
    htmlLink: null,
    status: 'confirmed',
    updatedDateTime: '2026-02-15T12:00:00Z',
    meetLink: null,
    ...overrides,
  };
}

const MOCK_EVENTS: CalendarEvent[] = [
  makeEvent({ id: 'evt1', summary: 'Morning Standup' }),
  makeEvent({ id: 'evt2', summary: 'Lunch Break', start: '2026-02-16T12:00:00Z' }),
];

function createMockStore(overrides: {
  events?: CalendarEvent[];
  eventsForSelectedDate?: CalendarEvent[];
  eventsForRange?: CalendarEvent[];
  loading?: boolean;
  error?: string | null;
  selectedDate?: string;
  syncToken?: string | null;
  viewMode?: CalendarViewMode;
  visibleRangeStart?: string | null;
  visibleRangeEnd?: string | null;
} = {}) {
  const store = jasmine.createSpyObj('CalendarStore',
    ['initialSync', 'incrementalSync', 'selectDate', 'setViewMode', 'setDateRange'],
    {
      events: signal(overrides.events ?? MOCK_EVENTS),
      eventsForSelectedDate: signal(overrides.eventsForSelectedDate ?? MOCK_EVENTS),
      eventsForRange: signal(overrides.eventsForRange ?? MOCK_EVENTS),
      loading: signal(overrides.loading ?? false),
      error: signal(overrides.error ?? null),
      selectedDate: signal(overrides.selectedDate ?? '2026-02-16'),
      syncToken: signal(overrides.syncToken ?? null),
      viewMode: signal(overrides.viewMode ?? 'timeGridWeek'),
      visibleRangeStart: signal(overrides.visibleRangeStart ?? null),
      visibleRangeEnd: signal(overrides.visibleRangeEnd ?? null),
    },
  );
  store.initialSync.and.resolveTo();
  store.incrementalSync.and.resolveTo();
  return store;
}

async function setup(storeOverrides: Parameters<typeof createMockStore>[0] = {}) {
  const mockStore = createMockStore(storeOverrides);
  const mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

  await TestBed.configureTestingModule({
    imports: [CalendarComponent],
    providers: [
      { provide: CalendarStore, useValue: mockStore },
      { provide: MatDialog, useValue: mockDialog },
      provideNoopAnimations(),
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(CalendarComponent);
  await fixture.whenStable();
  return { fixture, mockStore, mockDialog };
}

describe('CalendarComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('initialization', () => {
    it('should call initialSync on init', async () => {
      const { mockStore } = await setup();
      expect(mockStore.initialSync).toHaveBeenCalled();
    });

    it('should render the FullCalendar component', async () => {
      const { fixture } = await setup();
      const fc = fixture.debugElement.query(By.css('[data-testid="full-calendar"]'));
      expect(fc).toBeTruthy();
    });
  });

  describe('view mode toggling', () => {
    it('should render all 4 view toggle buttons', async () => {
      const { fixture } = await setup();
      const toggleGroup = fixture.debugElement.query(By.css('[data-testid="view-toggle"]'));
      expect(toggleGroup).toBeTruthy();
      const buttons = fixture.debugElement.queryAll(By.css('mat-button-toggle'));
      expect(buttons.length).toBe(4);
    });

    it('should call setViewMode when a view button is clicked', async () => {
      const { fixture, mockStore } = await setup();
      const buttons = fixture.debugElement.queryAll(By.css('mat-button-toggle'));
      // Click the Month button (last one)
      const monthButton = buttons[3];
      monthButton.nativeElement.querySelector('button')?.click();
      fixture.detectChanges();
      expect(mockStore.setViewMode).toHaveBeenCalledWith('dayGridMonth');
    });
  });

  describe('navigation controls', () => {
    it('should render prev, next, and today buttons', async () => {
      const { fixture } = await setup();
      expect(fixture.debugElement.query(By.css('[data-testid="prev-btn"]'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('[data-testid="next-btn"]'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('[data-testid="today-btn"]'))).toBeTruthy();
    });
  });

  describe('loading state', () => {
    it('should show spinner when loading', async () => {
      const { fixture } = await setup({ loading: true });
      const spinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(spinner).toBeTruthy();
    });
  });

  describe('error state', () => {
    it('should show error message when error exists', async () => {
      const { fixture } = await setup({ error: 'Failed to load' });
      const error = fixture.debugElement.query(By.css('[data-testid="error-message"]'));
      expect(error).toBeTruthy();
      expect(error.nativeElement.textContent).toContain('Failed to load');
    });
  });
});
