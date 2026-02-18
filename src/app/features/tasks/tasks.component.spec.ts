import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { TasksComponent } from './tasks.component';
import { TasksStore } from '../../state/tasks.store';
import type { Task, TaskList, TaskFilter } from '../../data/models/task.model';

const makeTasks = (): Task[] => [
  {
    id: 't1', localId: 'l1', title: 'Buy groceries', status: 'needsAction',
    dueDateTime: '2026-02-20T00:00:00.000Z', notes: 'Milk, bread',
    meta: null, parent: null, position: '001', updatedDateTime: '2026-02-16T00:00:00.000Z',
  },
  {
    id: 't2', localId: 'l2', title: 'Walk the dog', status: 'completed',
    dueDateTime: null, notes: null,
    meta: null, parent: null, position: '002', updatedDateTime: '2026-02-16T00:00:00.000Z',
  },
  {
    id: 't3', localId: 'l3', title: 'Sub-task', status: 'needsAction',
    dueDateTime: null, notes: null,
    meta: null, parent: 't1', position: '001', updatedDateTime: '2026-02-16T00:00:00.000Z',
  },
];

const makeTaskLists = (): TaskList[] => [
  { id: 'list1', title: 'My Tasks', updatedDateTime: '2026-02-16T00:00:00.000Z' },
  { id: 'list2', title: 'Work', updatedDateTime: '2026-02-16T00:00:00.000Z' },
];

function createMockStore(overrides: {
  tasks?: Task[];
  taskLists?: TaskList[];
  loading?: boolean;
  error?: string | null;
  filteredTasks?: Task[];
  filter?: TaskFilter;
  selectedListId?: string | null;
} = {}) {
  const tasks = overrides.tasks ?? makeTasks();
  const filtered = overrides.filteredTasks ?? tasks;
  const store = jasmine.createSpyObj('TasksStore',
    ['loadTaskLists', 'loadTasks', 'addTask', 'updateTask', 'toggleTaskStatus', 'removeTask', 'moveTask', 'setFilter', 'setSearchQuery'],
    {
      tasks: signal(tasks),
      taskLists: signal(overrides.taskLists ?? makeTaskLists()),
      loading: signal(overrides.loading ?? false),
      error: signal(overrides.error ?? null),
      filteredTasks: signal(filtered),
      completionRate: signal(0),
      taskCount: signal(tasks.length),
      filter: signal(overrides.filter ?? 'ALL' as TaskFilter),
      selectedListId: signal(overrides.selectedListId ?? 'list1'),
      searchQuery: signal(''),
    },
  );
  store.loadTaskLists.and.resolveTo();
  store.loadTasks.and.resolveTo();
  store.addTask.and.resolveTo();
  store.updateTask.and.resolveTo();
  store.toggleTaskStatus.and.resolveTo();
  store.removeTask.and.resolveTo();
  store.moveTask.and.resolveTo();
  return store;
}

function createMockSnackBar() {
  const actionSubject = new Subject<void>();
  const snackBarRef = jasmine.createSpyObj('MatSnackBarRef', ['onAction', 'dismiss']);
  snackBarRef.onAction.and.returnValue(actionSubject.asObservable());
  const mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
  mockSnackBar.open.and.returnValue(snackBarRef);
  return { mockSnackBar, snackBarRef, actionSubject };
}

async function setup(storeOverrides: Parameters<typeof createMockStore>[0] = {}) {
  const mockStore = createMockStore(storeOverrides);
  const { mockSnackBar, snackBarRef, actionSubject } = createMockSnackBar();

  await TestBed.configureTestingModule({
    imports: [TasksComponent],
    providers: [
      { provide: TasksStore, useValue: mockStore },
      provideNoopAnimations(),
    ],
  })
  .overrideComponent(TasksComponent, {
    set: {
      providers: [
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    },
  })
  .compileComponents();

  const fixture = TestBed.createComponent(TasksComponent);
  await fixture.whenStable();
  return { fixture, mockStore, mockSnackBar, snackBarRef, actionSubject };
}

describe('TasksComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('task list selector', () => {
    it('should render task list selector', async () => {
      const { fixture } = await setup();
      const select = fixture.debugElement.query(By.css('[data-testid="list-selector"]'));
      expect(select).toBeTruthy();
    });
  });

  describe('filter tabs', () => {
    it('should render filter tabs', async () => {
      const { fixture } = await setup();
      const tabs = fixture.debugElement.queryAll(By.css('[data-testid="filter-tab"]'));
      expect(tabs.length).toBe(3);
    });

    it('should call setFilter when a tab is clicked', async () => {
      const { fixture, mockStore } = await setup();
      const tabs = fixture.debugElement.queryAll(By.css('[data-testid="filter-tab"]'));
      tabs[1].nativeElement.querySelector('button').click();
      await fixture.whenStable();
      expect(mockStore.setFilter).toHaveBeenCalledWith('needsAction');
    });
  });

  describe('task rendering', () => {
    it('should render task cards for filtered tasks', async () => {
      const { fixture } = await setup();
      const cards = fixture.debugElement.queryAll(By.css('app-task-card'));
      expect(cards.length).toBe(3);
    });

    it('should show empty state when no tasks', async () => {
      const { fixture } = await setup({ tasks: [], filteredTasks: [] });
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
      const { fixture } = await setup({ error: 'Failed to load tasks' });
      const error = fixture.debugElement.query(By.css('[data-testid="error-message"]'));
      expect(error).toBeTruthy();
      expect(error.nativeElement.textContent).toContain('Failed to load tasks');
    });
  });

  describe('drag and drop', () => {
    it('should render drop list container', async () => {
      const { fixture } = await setup();
      const dropList = fixture.debugElement.query(By.css('[data-testid="task-list"]'));
      expect(dropList).toBeTruthy();
    });

    it('should call moveTask when task is reordered', async () => {
      const { fixture, mockStore } = await setup();
      const dropList = fixture.debugElement.query(By.css('[data-testid="task-list"]'));

      // Simulate dropping t1 (index 0) to after t3 (index 2)
      dropList.triggerEventHandler('cdkDropListDropped', {
        previousIndex: 0,
        currentIndex: 2,
      });

      // After moveItemInArray([t1,t2,t3], 0, 2) -> [t2,t3,t1]
      // movedTask = t1 (at index 2), previous = t3 (at index 1)
      expect(mockStore.moveTask).toHaveBeenCalledWith('t1', { previous: 't3' });
    });

    it('should not call moveTask when dropped at same position', async () => {
      const { fixture, mockStore } = await setup();
      const dropList = fixture.debugElement.query(By.css('[data-testid="task-list"]'));

      dropList.triggerEventHandler('cdkDropListDropped', {
        previousIndex: 1,
        currentIndex: 1,
      });

      expect(mockStore.moveTask).not.toHaveBeenCalled();
    });

    it('should pass undefined previous when moved to first position', async () => {
      const { fixture, mockStore } = await setup();
      const dropList = fixture.debugElement.query(By.css('[data-testid="task-list"]'));

      // Simulate dropping t3 (index 2) to first position (index 0)
      dropList.triggerEventHandler('cdkDropListDropped', {
        previousIndex: 2,
        currentIndex: 0,
      });

      // After moveItemInArray([t1,t2,t3], 2, 0) -> [t3,t1,t2]
      // movedTask = t3 (at index 0), previous = undefined (first position)
      expect(mockStore.moveTask).toHaveBeenCalledWith('t3', {});
    });
  });

  describe('interactions', () => {
    it('should toggle task status when card emits toggle', async () => {
      const { fixture, mockStore } = await setup();
      const card = fixture.debugElement.query(By.css('app-task-card'));
      card.triggerEventHandler('toggle', 't1');
      expect(mockStore.toggleTaskStatus).toHaveBeenCalledWith('t1');
    });

    it('should call removeTask and show snackbar when card emits delete', async () => {
      const { fixture, mockStore, mockSnackBar } = await setup();
      const card = fixture.debugElement.query(By.css('app-task-card'));
      card.triggerEventHandler('delete', 't1');
      await fixture.whenStable();

      expect(mockStore.removeTask).toHaveBeenCalledWith('t1');
      expect(mockSnackBar.open).toHaveBeenCalledWith('Task deleted', 'Undo', { duration: 5000 });
    });

    it('should show FAB for adding a new task', async () => {
      const { fixture } = await setup();
      const fab = fixture.debugElement.query(By.css('[data-testid="add-task-fab"]'));
      expect(fab).toBeTruthy();
    });
  });

  describe('delete task with snackbar undo', () => {
    it('should not call removeTask when task id is not found in store.tasks', async () => {
      // tasks() returns empty so find() returns undefined, but filteredTasks renders cards
      const emptyTaskStore = createMockStore({ tasks: [], filteredTasks: makeTasks() });
      const { mockSnackBar: snackBarMock } = createMockSnackBar();
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [TasksComponent],
        providers: [
          { provide: TasksStore, useValue: emptyTaskStore },
          provideNoopAnimations(),
        ],
      })
      .overrideComponent(TasksComponent, {
        set: { providers: [{ provide: MatSnackBar, useValue: snackBarMock }] },
      })
      .compileComponents();
      const f = TestBed.createComponent(TasksComponent);
      await f.whenStable();
      const card = f.debugElement.query(By.css('app-task-card'));
      card.triggerEventHandler('delete', 't1');
      await f.whenStable();

      expect(emptyTaskStore.removeTask).not.toHaveBeenCalled();
      expect(snackBarMock.open).not.toHaveBeenCalled();
    });

    it('should call addTask with task data when undo action is triggered', async () => {
      const { fixture, mockStore, actionSubject } = await setup();
      const card = fixture.debugElement.query(By.css('app-task-card'));
      card.triggerEventHandler('delete', 't1');
      await fixture.whenStable();

      // Simulate clicking Undo
      actionSubject.next();
      await fixture.whenStable();

      expect(mockStore.addTask).toHaveBeenCalledWith(jasmine.objectContaining({
        title: 'Buy groceries',
        notes: 'Milk, bread',
      }));
    });

    it('should call addTask with undefined notes when task has no notes', async () => {
      const { fixture, mockStore, actionSubject } = await setup();
      const cards = fixture.debugElement.queryAll(By.css('app-task-card'));
      // t2 has no notes (null)
      cards[1].triggerEventHandler('delete', 't2');
      await fixture.whenStable();

      actionSubject.next();
      await fixture.whenStable();

      expect(mockStore.addTask).toHaveBeenCalledWith(jasmine.objectContaining({
        title: 'Walk the dog',
        notes: undefined,
      }));
    });
  });
});
