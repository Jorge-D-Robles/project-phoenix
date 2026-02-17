import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';

import { DashboardComponent } from './dashboard.component';
import { DashboardStore } from '../../state/dashboard.store';
import { TasksStore } from '../../state/tasks.store';
import { HabitsStore } from '../../state/habits.store';
import type { Task } from '../../data/models/task.model';
import type { CalendarEvent } from '../../data/models/calendar-event.model';
import type { HabitStatusEntry, CompletionSummary } from '../../state/dashboard.store';
import type { Note } from '../../data/models/note.model';

const MOCK_TASKS: Task[] = [
  {
    id: 't1', localId: 'l1', title: 'Test task', status: 'needsAction',
    dueDateTime: '2026-02-16T10:00:00Z', notes: null, meta: null,
    parent: null, position: '001', updatedDateTime: '2026-02-16T00:00:00Z',
  },
];

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: 'e1', summary: 'Meeting', description: null,
    start: '2026-02-16T09:00:00Z', end: '2026-02-16T10:00:00Z',
    allDay: false, colorId: '1', color: { name: 'Lavender', hex: '#7986CB' },
    location: null, htmlLink: null, status: 'confirmed',
    updatedDateTime: '2026-02-16T00:00:00Z',
  },
];

const MOCK_HABIT_STATUS: HabitStatusEntry[] = [
  {
    habit: {
      id: 'h1', title: 'Exercise', frequency: 'DAILY', targetValue: 1,
      color: '#FF0000', archived: false, created: '2026-01-01T00:00:00Z',
      lastModified: '2026-02-16T00:00:00Z',
    },
    loggedToday: false,
    todayValue: 0,
  },
];

const MOCK_NOTES: Note[] = [
  {
    id: 'n1', title: 'Note', content: 'Content',
    labels: [], color: 'DEFAULT', attachments: [], pinned: false, archived: false,
    created: '2026-02-16T00:00:00Z', lastModified: '2026-02-16T12:00:00Z',
  },
];

const MOCK_SUMMARY: CompletionSummary = { done: 0, total: 1, percentage: 0 };

function createMockDashboardStore() {
  return jasmine.createSpyObj('DashboardStore',
    ['loadAll'],
    {
      initialized: signal(true),
      todayTasks: signal(MOCK_TASKS),
      todayEvents: signal(MOCK_EVENTS),
      habitStatus: signal(MOCK_HABIT_STATUS),
      recentNotes: signal(MOCK_NOTES),
      greeting: signal('Good morning, Test'),
      completionSummary: signal(MOCK_SUMMARY),
    },
  );
}

function createMockTasksStore() {
  return jasmine.createSpyObj('TasksStore',
    ['toggleTaskStatus'],
  );
}

function createMockHabitsStore() {
  return jasmine.createSpyObj('HabitsStore',
    ['logHabit'],
  );
}

describe('DashboardComponent', () => {
  let mockDashboardStore: ReturnType<typeof createMockDashboardStore>;
  let mockTasksStore: ReturnType<typeof createMockTasksStore>;
  let mockHabitsStore: ReturnType<typeof createMockHabitsStore>;

  async function setup() {
    mockDashboardStore = createMockDashboardStore();
    mockTasksStore = createMockTasksStore();
    mockHabitsStore = createMockHabitsStore();
    mockDashboardStore.loadAll.and.resolveTo();
    mockTasksStore.toggleTaskStatus.and.resolveTo();
    mockHabitsStore.logHabit.and.resolveTo();

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: DashboardStore, useValue: mockDashboardStore },
        { provide: TasksStore, useValue: mockTasksStore },
        { provide: HabitsStore, useValue: mockHabitsStore },
        provideNoopAnimations(),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DashboardComponent);
    await fixture.whenStable();
    return fixture;
  }

  afterEach(() => TestBed.resetTestingModule());

  describe('initialization', () => {
    it('should call loadAll on the dashboard store', async () => {
      await setup();
      expect(mockDashboardStore.loadAll).toHaveBeenCalled();
    });
  });

  describe('rendering', () => {
    it('should render the greeting header', async () => {
      const fixture = await setup();
      const header = fixture.debugElement.query(By.css('app-greeting-header'));
      expect(header).toBeTruthy();
    });

    it('should render the task summary widget', async () => {
      const fixture = await setup();
      const widget = fixture.debugElement.query(By.css('app-task-summary-widget'));
      expect(widget).toBeTruthy();
    });

    it('should render the schedule timeline widget', async () => {
      const fixture = await setup();
      const widget = fixture.debugElement.query(By.css('app-schedule-timeline-widget'));
      expect(widget).toBeTruthy();
    });

    it('should render the habit status widget', async () => {
      const fixture = await setup();
      const widget = fixture.debugElement.query(By.css('app-habit-status-widget'));
      expect(widget).toBeTruthy();
    });

    it('should render the recent notes widget', async () => {
      const fixture = await setup();
      const widget = fixture.debugElement.query(By.css('app-recent-notes-widget'));
      expect(widget).toBeTruthy();
    });

    it('should render the dashboard grid', async () => {
      const fixture = await setup();
      const grid = fixture.debugElement.query(By.css('[data-testid="dashboard-grid"]'));
      expect(grid).toBeTruthy();
    });
  });

  describe('event forwarding', () => {
    it('should forward toggle event to tasks store', async () => {
      const fixture = await setup();
      const taskWidget = fixture.debugElement.query(By.css('app-task-summary-widget'));
      taskWidget.triggerEventHandler('toggle', 't1');
      expect(mockTasksStore.toggleTaskStatus).toHaveBeenCalledWith('t1');
    });

    it('should forward logHabit event to habits store', async () => {
      const fixture = await setup();
      const habitWidget = fixture.debugElement.query(By.css('app-habit-status-widget'));
      habitWidget.triggerEventHandler('logHabit', 'h1');
      expect(mockHabitsStore.logHabit).toHaveBeenCalledWith('h1', jasmine.any(String), 1);
    });
  });
});
