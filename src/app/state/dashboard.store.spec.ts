import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { DashboardStore } from './dashboard.store';
import { TasksStore } from './tasks.store';
import { CalendarStore } from './calendar.store';
import { HabitsStore } from './habits.store';
import { NotesStore } from './notes.store';
import { AuthService } from '../core/auth.service';
import type { Task, TaskList } from '../data/models/task.model';
import type { CalendarEvent } from '../data/models/calendar-event.model';
import type { Habit, HabitLog } from '../data/models/habit.model';
import type { Note } from '../data/models/note.model';

const TODAY = new Date().toISOString().split('T')[0];
const YESTERDAY = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
})();
const TOMORROW = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
})();

const MOCK_TASKS: Task[] = [
  {
    id: 't1', localId: 'l1', title: 'Due today', status: 'needsAction',
    dueDateTime: `${TODAY}T10:00:00Z`, notes: null, meta: null,
    parent: null, position: '001', updatedDateTime: '2026-02-16T00:00:00Z',
  },
  {
    id: 't2', localId: 'l2', title: 'Overdue', status: 'needsAction',
    dueDateTime: `${YESTERDAY}T10:00:00Z`, notes: null, meta: null,
    parent: null, position: '002', updatedDateTime: '2026-02-16T00:00:00Z',
  },
  {
    id: 't3', localId: 'l3', title: 'Tomorrow', status: 'needsAction',
    dueDateTime: `${TOMORROW}T10:00:00Z`, notes: null, meta: null,
    parent: null, position: '003', updatedDateTime: '2026-02-16T00:00:00Z',
  },
  {
    id: 't4', localId: 'l4', title: 'Completed today', status: 'completed',
    dueDateTime: `${TODAY}T09:00:00Z`, notes: null, meta: null,
    parent: null, position: '004', updatedDateTime: '2026-02-16T00:00:00Z',
  },
  {
    id: 't5', localId: 'l5', title: 'No due date', status: 'needsAction',
    dueDateTime: null, notes: null, meta: null,
    parent: null, position: '005', updatedDateTime: '2026-02-16T00:00:00Z',
  },
];

const MOCK_TASK_LISTS: TaskList[] = [
  { id: 'list1', title: 'My Tasks', updatedDateTime: '2026-02-16T00:00:00Z' },
];

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: 'e1', summary: 'Morning meeting', description: null,
    start: `${TODAY}T09:00:00Z`, end: `${TODAY}T10:00:00Z`,
    allDay: false, colorId: '1', color: { name: 'Lavender', hex: '#7986CB' },
    location: 'Room A', htmlLink: null, status: 'confirmed',
    updatedDateTime: '2026-02-16T00:00:00Z', meetLink: null,
  },
  {
    id: 'e2', summary: 'Lunch', description: null,
    start: `${TODAY}T12:00:00Z`, end: `${TODAY}T13:00:00Z`,
    allDay: false, colorId: null, color: { name: 'Default', hex: '#4285F4' },
    location: null, htmlLink: null, status: 'confirmed',
    updatedDateTime: '2026-02-16T00:00:00Z', meetLink: null,
  },
  {
    id: 'e3', summary: 'Yesterday event', description: null,
    start: `${YESTERDAY}T09:00:00Z`, end: `${YESTERDAY}T10:00:00Z`,
    allDay: false, colorId: null, color: { name: 'Default', hex: '#4285F4' },
    location: null, htmlLink: null, status: 'confirmed',
    updatedDateTime: '2026-02-16T00:00:00Z', meetLink: null,
  },
];

const MOCK_HABITS: Habit[] = [
  {
    id: 'h1', title: 'Exercise', frequency: 'DAILY', targetValue: 1,
    color: '#FF0000', archived: false, created: '2026-01-01T00:00:00Z',
    lastModified: '2026-02-16T00:00:00Z',
  },
  {
    id: 'h2', title: 'Read', frequency: 'DAILY', targetValue: 30,
    color: '#00FF00', archived: false, created: '2026-01-01T00:00:00Z',
    lastModified: '2026-02-16T00:00:00Z',
  },
  {
    id: 'h3', title: 'Archived habit', frequency: 'WEEKLY', targetValue: 1,
    color: '#0000FF', archived: true, created: '2026-01-01T00:00:00Z',
    lastModified: '2026-02-16T00:00:00Z',
  },
];

const MOCK_LOGS: HabitLog[] = [
  { habitId: 'h1', date: TODAY, value: 1 },
  { habitId: 'h2', date: YESTERDAY, value: 15 },
];

const MOCK_NOTES: Note[] = [
  {
    id: 'n1', title: 'Recent note', content: 'Content 1',
    labels: ['work'], color: 'BLUE', attachments: [], pinned: false, archived: false,
    created: '2026-02-16T00:00:00Z', lastModified: '2026-02-16T12:00:00Z',
  },
  {
    id: 'n2', title: 'Older note', content: 'Content 2',
    labels: [], color: 'DEFAULT', attachments: [], pinned: false, archived: false,
    created: '2026-02-15T00:00:00Z', lastModified: '2026-02-15T12:00:00Z',
  },
  {
    id: 'n3', title: 'Oldest note', content: 'Content 3',
    labels: [], color: 'DEFAULT', attachments: [], pinned: false, archived: false,
    created: '2026-02-14T00:00:00Z', lastModified: '2026-02-14T12:00:00Z',
  },
  {
    id: 'n4', title: 'Second recent', content: 'Content 4',
    labels: ['personal'], color: 'GREEN', attachments: [], pinned: false, archived: false,
    created: '2026-02-16T00:00:00Z', lastModified: '2026-02-16T10:00:00Z',
  },
  {
    id: 'n5', title: 'Fifth note', content: 'Content 5',
    labels: [], color: 'DEFAULT', attachments: [], pinned: false, archived: false,
    created: '2026-02-13T00:00:00Z', lastModified: '2026-02-13T12:00:00Z',
  },
];

function createMockTasksStore(overrides: {
  tasks?: Task[];
  taskLists?: TaskList[];
} = {}) {
  return jasmine.createSpyObj('TasksStore',
    ['loadTaskLists', 'loadTasks', 'toggleTaskStatus'],
    {
      tasks: signal(overrides.tasks ?? MOCK_TASKS),
      taskLists: signal(overrides.taskLists ?? MOCK_TASK_LISTS),
    },
  );
}

function createMockCalendarStore(overrides: {
  events?: CalendarEvent[];
} = {}) {
  return jasmine.createSpyObj('CalendarStore',
    ['initialSync'],
    {
      events: signal(overrides.events ?? MOCK_EVENTS),
    },
  );
}

function createMockHabitsStore(overrides: {
  activeHabits?: Habit[];
  logs?: HabitLog[];
} = {}) {
  return jasmine.createSpyObj('HabitsStore',
    ['loadData', 'logHabit'],
    {
      activeHabits: signal(overrides.activeHabits ?? MOCK_HABITS.filter(h => !h.archived)),
      logs: signal(overrides.logs ?? MOCK_LOGS),
    },
  );
}

function createMockNotesStore(overrides: {
  notes?: Note[];
} = {}) {
  return jasmine.createSpyObj('NotesStore',
    ['loadNotes'],
    {
      notes: signal(overrides.notes ?? MOCK_NOTES),
    },
  );
}

function createMockAuthService(overrides: {
  userName?: string;
} = {}) {
  return jasmine.createSpyObj('AuthService', ['login'], {
    user: signal({ email: 'test@test.com', name: overrides.userName ?? 'Test User', picture: '' }),
  });
}

describe('DashboardStore', () => {
  let store: InstanceType<typeof DashboardStore>;
  let mockTasksStore: ReturnType<typeof createMockTasksStore>;
  let mockCalendarStore: ReturnType<typeof createMockCalendarStore>;
  let mockHabitsStore: ReturnType<typeof createMockHabitsStore>;
  let mockNotesStore: ReturnType<typeof createMockNotesStore>;
  let mockAuthService: ReturnType<typeof createMockAuthService>;

  beforeEach(() => {
    mockTasksStore = createMockTasksStore();
    mockCalendarStore = createMockCalendarStore();
    mockHabitsStore = createMockHabitsStore();
    mockNotesStore = createMockNotesStore();
    mockAuthService = createMockAuthService();

    mockTasksStore.loadTaskLists.and.resolveTo();
    mockTasksStore.loadTasks.and.resolveTo();
    mockCalendarStore.initialSync.and.resolveTo();
    mockHabitsStore.loadData.and.resolveTo();
    mockNotesStore.loadNotes.and.resolveTo();

    TestBed.configureTestingModule({
      providers: [
        DashboardStore,
        { provide: TasksStore, useValue: mockTasksStore },
        { provide: CalendarStore, useValue: mockCalendarStore },
        { provide: HabitsStore, useValue: mockHabitsStore },
        { provide: NotesStore, useValue: mockNotesStore },
        { provide: AuthService, useValue: mockAuthService },
      ],
    });

    store = TestBed.inject(DashboardStore);
  });

  describe('initial state', () => {
    it('should have initialized as false', () => {
      expect(store.initialized()).toBe(false);
    });
  });

  describe('computed: todayTasks', () => {
    it('should include tasks due today with needsAction status', () => {
      const tasks = store.todayTasks();
      expect(tasks.some(t => t.id === 't1')).toBeTrue();
    });

    it('should include overdue tasks with needsAction status', () => {
      const tasks = store.todayTasks();
      expect(tasks.some(t => t.id === 't2')).toBeTrue();
    });

    it('should not include tasks due tomorrow', () => {
      const tasks = store.todayTasks();
      expect(tasks.some(t => t.id === 't3')).toBeFalse();
    });

    it('should not include completed tasks', () => {
      const tasks = store.todayTasks();
      expect(tasks.some(t => t.id === 't4')).toBeFalse();
    });

    it('should not include tasks with no due date', () => {
      const tasks = store.todayTasks();
      expect(tasks.some(t => t.id === 't5')).toBeFalse();
    });

    it('should return empty array when no tasks match', () => {
      mockTasksStore = createMockTasksStore({ tasks: [] });
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          DashboardStore,
          { provide: TasksStore, useValue: mockTasksStore },
          { provide: CalendarStore, useValue: mockCalendarStore },
          { provide: HabitsStore, useValue: mockHabitsStore },
          { provide: NotesStore, useValue: mockNotesStore },
          { provide: AuthService, useValue: mockAuthService },
        ],
      });
      store = TestBed.inject(DashboardStore);
      expect(store.todayTasks()).toEqual([]);
    });
  });

  describe('computed: todayEvents', () => {
    it('should include events with start date matching today', () => {
      const events = store.todayEvents();
      expect(events.some(e => e.id === 'e1')).toBeTrue();
      expect(events.some(e => e.id === 'e2')).toBeTrue();
    });

    it('should not include events from other dates', () => {
      const events = store.todayEvents();
      expect(events.some(e => e.id === 'e3')).toBeFalse();
    });

    it('should sort events by start time ascending', () => {
      const events = store.todayEvents();
      expect(events[0].id).toBe('e1');
      expect(events[1].id).toBe('e2');
    });

    it('should return empty array when no events today', () => {
      mockCalendarStore = createMockCalendarStore({ events: [] });
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          DashboardStore,
          { provide: TasksStore, useValue: mockTasksStore },
          { provide: CalendarStore, useValue: mockCalendarStore },
          { provide: HabitsStore, useValue: mockHabitsStore },
          { provide: NotesStore, useValue: mockNotesStore },
          { provide: AuthService, useValue: mockAuthService },
        ],
      });
      store = TestBed.inject(DashboardStore);
      expect(store.todayEvents()).toEqual([]);
    });
  });

  describe('computed: habitStatus', () => {
    it('should return status for each active habit', () => {
      const status = store.habitStatus();
      expect(status.length).toBe(2);
    });

    it('should not include archived habits', () => {
      const status = store.habitStatus();
      expect(status.some(s => s.habit.id === 'h3')).toBeFalse();
    });

    it('should mark habit as logged today when log exists for today', () => {
      const status = store.habitStatus();
      const exercise = status.find(s => s.habit.id === 'h1');
      expect(exercise?.loggedToday).toBeTrue();
      expect(exercise?.todayValue).toBe(1);
    });

    it('should mark habit as not logged today when no log for today', () => {
      const status = store.habitStatus();
      const read = status.find(s => s.habit.id === 'h2');
      expect(read?.loggedToday).toBeFalse();
      expect(read?.todayValue).toBe(0);
    });
  });

  describe('computed: recentNotes', () => {
    it('should return at most 4 notes', () => {
      const notes = store.recentNotes();
      expect(notes.length).toBe(4);
    });

    it('should sort notes by lastModified descending', () => {
      const notes = store.recentNotes();
      expect(notes[0].id).toBe('n1');
      expect(notes[1].id).toBe('n4');
      expect(notes[2].id).toBe('n2');
      expect(notes[3].id).toBe('n3');
    });

    it('should return all notes when fewer than 4', () => {
      mockNotesStore = createMockNotesStore({ notes: [MOCK_NOTES[0], MOCK_NOTES[1]] });
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          DashboardStore,
          { provide: TasksStore, useValue: mockTasksStore },
          { provide: CalendarStore, useValue: mockCalendarStore },
          { provide: HabitsStore, useValue: mockHabitsStore },
          { provide: NotesStore, useValue: mockNotesStore },
          { provide: AuthService, useValue: mockAuthService },
        ],
      });
      store = TestBed.inject(DashboardStore);
      expect(store.recentNotes().length).toBe(2);
    });
  });

  describe('computed: greeting', () => {
    it('should include the user name', () => {
      expect(store.greeting()).toContain('Test User');
    });

    it('should contain a time-of-day greeting', () => {
      const greeting = store.greeting();
      expect(
        greeting.includes('Good morning') ||
        greeting.includes('Good afternoon') ||
        greeting.includes('Good evening')
      ).toBeTrue();
    });
  });

  describe('computed: completionSummary', () => {
    it('should count today tasks and completed today tasks', () => {
      // todayTasks (needsAction, due today or overdue): t1, t2 = 2 tasks
      // completedTodayTasks (completed, due today): t4 = 1 task
      // total = 2 + 1 = 3, done = 1
      const summary = store.completionSummary();
      expect(summary.total).toBe(3);
      expect(summary.done).toBe(1);
    });

    it('should calculate percentage correctly', () => {
      const summary = store.completionSummary();
      expect(summary.percentage).toBeCloseTo(33.33, 0);
    });

    it('should return zero percentage when no tasks', () => {
      mockTasksStore = createMockTasksStore({ tasks: [] });
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          DashboardStore,
          { provide: TasksStore, useValue: mockTasksStore },
          { provide: CalendarStore, useValue: mockCalendarStore },
          { provide: HabitsStore, useValue: mockHabitsStore },
          { provide: NotesStore, useValue: mockNotesStore },
          { provide: AuthService, useValue: mockAuthService },
        ],
      });
      store = TestBed.inject(DashboardStore);
      const summary = store.completionSummary();
      expect(summary.total).toBe(0);
      expect(summary.done).toBe(0);
      expect(summary.percentage).toBe(0);
    });
  });

  describe('method: loadAll', () => {
    it('should call loadTaskLists on tasks store', async () => {
      await store.loadAll();
      expect(mockTasksStore.loadTaskLists).toHaveBeenCalled();
    });

    it('should call initialSync on calendar store', async () => {
      await store.loadAll();
      expect(mockCalendarStore.initialSync).toHaveBeenCalled();
    });

    it('should call loadData on habits store', async () => {
      await store.loadAll();
      expect(mockHabitsStore.loadData).toHaveBeenCalled();
    });

    it('should call loadNotes on notes store', async () => {
      await store.loadAll();
      expect(mockNotesStore.loadNotes).toHaveBeenCalled();
    });

    it('should call loadTasks with first list ID after loadTaskLists', async () => {
      await store.loadAll();
      expect(mockTasksStore.loadTasks).toHaveBeenCalledWith('list1');
    });

    it('should not call loadTasks when no task lists exist', async () => {
      mockTasksStore = createMockTasksStore({ taskLists: [] });
      mockTasksStore.loadTaskLists.and.resolveTo();
      mockTasksStore.loadTasks.and.resolveTo();
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          DashboardStore,
          { provide: TasksStore, useValue: mockTasksStore },
          { provide: CalendarStore, useValue: mockCalendarStore },
          { provide: HabitsStore, useValue: mockHabitsStore },
          { provide: NotesStore, useValue: mockNotesStore },
          { provide: AuthService, useValue: mockAuthService },
        ],
      });
      store = TestBed.inject(DashboardStore);
      await store.loadAll();
      expect(mockTasksStore.loadTasks).not.toHaveBeenCalled();
    });

    it('should set initialized to true after loading', async () => {
      await store.loadAll();
      expect(store.initialized()).toBe(true);
    });
  });
});
