import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { HabitsComponent } from './habits.component';
import { HabitsStore } from '../../state/habits.store';
import type { Habit, HabitLog } from '../../data/models/habit.model';

const MOCK_HABITS: Habit[] = [
  {
    id: 'h1',
    title: 'Exercise',
    frequency: 'DAILY',
    targetValue: 1,
    color: '#4CAF50',
    archived: false,
    created: '2026-02-01T00:00:00Z',
    lastModified: '2026-02-01T00:00:00Z',
  },
  {
    id: 'h2',
    title: 'Read',
    frequency: 'DAILY',
    targetValue: 30,
    color: '#2196F3',
    archived: false,
    created: '2026-02-01T00:00:00Z',
    lastModified: '2026-02-01T00:00:00Z',
  },
];

const MOCK_LOGS: HabitLog[] = [
  { habitId: 'h1', date: '2026-02-16', value: 1 },
];

function createMockStore(overrides: {
  habits?: Habit[];
  logs?: HabitLog[];
  activeHabits?: Habit[];
  selectedHabit?: Habit | null;
  selectedHabitId?: string | null;
  logsForSelectedHabit?: HabitLog[];
  loading?: boolean;
  error?: string | null;
} = {}) {
  const store = jasmine.createSpyObj('HabitsStore',
    ['loadData', 'addHabit', 'updateHabit', 'archiveHabit', 'logHabit', 'selectHabit', 'deleteLog'],
    {
      habits: signal(overrides.habits ?? MOCK_HABITS),
      logs: signal(overrides.logs ?? MOCK_LOGS),
      activeHabits: signal(overrides.activeHabits ?? MOCK_HABITS),
      selectedHabit: signal(overrides.selectedHabit ?? null),
      selectedHabitId: signal(overrides.selectedHabitId ?? null),
      logsForSelectedHabit: signal(overrides.logsForSelectedHabit ?? []),
      loading: signal(overrides.loading ?? false),
      error: signal(overrides.error ?? null),
    },
  );
  store.loadData.and.resolveTo();
  store.addHabit.and.resolveTo();
  store.logHabit.and.resolveTo();
  store.archiveHabit.and.resolveTo();
  store.selectHabit.and.stub();
  return store;
}

async function setup(storeOverrides: Parameters<typeof createMockStore>[0] = {}) {
  const mockStore = createMockStore(storeOverrides);

  await TestBed.configureTestingModule({
    imports: [HabitsComponent],
    providers: [
      { provide: HabitsStore, useValue: mockStore },
      provideNoopAnimations(),
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(HabitsComponent);
  await fixture.whenStable();
  return { fixture, mockStore };
}

describe('HabitsComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('initialization', () => {
    it('should call loadData on init', async () => {
      const { mockStore } = await setup();
      expect(mockStore.loadData).toHaveBeenCalled();
    });
  });

  describe('habit list rendering', () => {
    it('should render habit cards for active habits', async () => {
      const { fixture } = await setup();
      const cards = fixture.debugElement.queryAll(By.css('app-habit-card'));
      expect(cards.length).toBe(2);
    });

    it('should show empty state when no active habits', async () => {
      const { fixture } = await setup({ activeHabits: [] });
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

  describe('add habit', () => {
    it('should display an Add Habit button', async () => {
      const { fixture } = await setup();
      const addBtn = fixture.debugElement.query(By.css('[data-testid="add-habit-btn"]'));
      expect(addBtn).toBeTruthy();
    });
  });

  describe('selected habit detail', () => {
    it('should show heatmap when a habit is selected', async () => {
      const { fixture } = await setup({
        selectedHabit: MOCK_HABITS[0],
        selectedHabitId: 'h1',
        logsForSelectedHabit: MOCK_LOGS,
      });
      const heatmap = fixture.debugElement.query(By.css('app-heatmap'));
      expect(heatmap).toBeTruthy();
    });

    it('should not show heatmap when no habit is selected', async () => {
      const { fixture } = await setup();
      const heatmap = fixture.debugElement.query(By.css('app-heatmap'));
      expect(heatmap).toBeNull();
    });
  });
});
