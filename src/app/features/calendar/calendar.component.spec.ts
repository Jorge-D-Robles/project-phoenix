import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { CalendarComponent } from './calendar.component';
import { CalendarStore } from '../../state/calendar.store';
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
  loading?: boolean;
  error?: string | null;
  selectedDate?: string;
  syncToken?: string | null;
} = {}) {
  const store = jasmine.createSpyObj('CalendarStore',
    ['initialSync', 'incrementalSync', 'selectDate'],
    {
      events: signal(overrides.events ?? MOCK_EVENTS),
      eventsForSelectedDate: signal(overrides.eventsForSelectedDate ?? MOCK_EVENTS),
      loading: signal(overrides.loading ?? false),
      error: signal(overrides.error ?? null),
      selectedDate: signal(overrides.selectedDate ?? '2026-02-16'),
      syncToken: signal(overrides.syncToken ?? null),
    },
  );
  store.initialSync.and.resolveTo();
  store.incrementalSync.and.resolveTo();
  return store;
}

async function setup(storeOverrides: Parameters<typeof createMockStore>[0] = {}) {
  const mockStore = createMockStore(storeOverrides);

  await TestBed.configureTestingModule({
    imports: [CalendarComponent],
    providers: [
      { provide: CalendarStore, useValue: mockStore },
      provideNoopAnimations(),
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(CalendarComponent);
  await fixture.whenStable();
  return { fixture, mockStore };
}

describe('CalendarComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('initialization', () => {
    it('should call initialSync on init', async () => {
      const { mockStore } = await setup();
      expect(mockStore.initialSync).toHaveBeenCalled();
    });
  });

  describe('date navigation', () => {
    it('should display the selected date', async () => {
      const { fixture } = await setup();
      const dateLabel = fixture.debugElement.query(By.css('[data-testid="selected-date"]'));
      expect(dateLabel).toBeTruthy();
      expect(dateLabel.nativeElement.textContent).toBeTruthy();
    });

    it('should call selectDate with previous day when back button clicked', async () => {
      const { fixture, mockStore } = await setup({ selectedDate: '2026-02-16' });
      const prevBtn = fixture.debugElement.query(By.css('[data-testid="prev-day"]'));
      prevBtn.nativeElement.click();
      expect(mockStore.selectDate).toHaveBeenCalledWith('2026-02-15');
    });

    it('should call selectDate with next day when forward button clicked', async () => {
      const { fixture, mockStore } = await setup({ selectedDate: '2026-02-16' });
      const nextBtn = fixture.debugElement.query(By.css('[data-testid="next-day"]'));
      nextBtn.nativeElement.click();
      expect(mockStore.selectDate).toHaveBeenCalledWith('2026-02-17');
    });

    it('should call selectDate with today when today button clicked', async () => {
      const { fixture, mockStore } = await setup({ selectedDate: '2026-03-01' });
      const todayBtn = fixture.debugElement.query(By.css('[data-testid="today-btn"]'));
      todayBtn.nativeElement.click();
      const today = new Date().toISOString().split('T')[0];
      expect(mockStore.selectDate).toHaveBeenCalledWith(today);
    });
  });

  describe('event rendering', () => {
    it('should render event cards for day events', async () => {
      const { fixture } = await setup();
      const cards = fixture.debugElement.queryAll(By.css('app-event-card'));
      expect(cards.length).toBe(2);
    });

    it('should show empty state when no events', async () => {
      const { fixture } = await setup({ eventsForSelectedDate: [] });
      const empty = fixture.debugElement.query(By.css('[data-testid="empty-state"]'));
      expect(empty).toBeTruthy();
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
