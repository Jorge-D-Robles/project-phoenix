import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { TasksStore } from './tasks.store';
import { TaskService } from '../data/task.service';
import type { Task, TaskList } from '../data/models/task.model';

const MOCK_TASKS: Task[] = [
  {
    id: 't1', localId: 'uuid-1', title: 'Buy groceries', status: 'needsAction',
    dueDateTime: '2026-02-20T00:00:00Z', notes: 'Milk and eggs', meta: { localId: 'uuid-1' },
    parent: null, position: '00000', updatedDateTime: '2026-02-16T10:00:00Z',
  },
  {
    id: 't2', localId: 'uuid-2', title: 'Write tests', status: 'completed',
    dueDateTime: null, notes: null, meta: { localId: 'uuid-2', tags: ['dev'] },
    parent: null, position: '00001', updatedDateTime: '2026-02-16T11:00:00Z',
  },
  {
    id: 't3', localId: 't3', title: 'Review PR', status: 'needsAction',
    dueDateTime: null, notes: null, meta: null,
    parent: null, position: '00002', updatedDateTime: '2026-02-16T12:00:00Z',
  },
];

const MOCK_LISTS: TaskList[] = [
  { id: 'list1', title: 'My Tasks', updatedDateTime: '2026-02-16T00:00:00Z' },
  { id: 'list2', title: 'Work', updatedDateTime: '2026-02-16T00:00:00Z' },
];

describe('TasksStore', () => {
  let store: InstanceType<typeof TasksStore>;
  let mockTaskService: jasmine.SpyObj<TaskService>;

  beforeEach(() => {
    mockTaskService = jasmine.createSpyObj('TaskService', [
      'getTaskLists', 'getTasks', 'createTask', 'updateTask', 'deleteTask', 'moveTask',
    ]);
    mockTaskService.getTaskLists.and.returnValue(of(MOCK_LISTS));
    mockTaskService.getTasks.and.returnValue(of(MOCK_TASKS));

    TestBed.configureTestingModule({
      providers: [
        TasksStore,
        { provide: TaskService, useValue: mockTaskService },
      ],
    });

    store = TestBed.inject(TasksStore);
  });

  describe('initial state', () => {
    it('should have correct defaults', () => {
      expect(store.tasks()).toEqual([]);
      expect(store.taskLists()).toEqual([]);
      expect(store.loading()).toBe(false);
      expect(store.filter()).toBe('ALL');
      expect(store.selectedListId()).toBeNull();
      expect(store.error()).toBeNull();
    });
  });

  describe('computed: filteredTasks', () => {
    it('should return all tasks when filter is ALL', async () => {
      await store.loadTasks('list1');
      expect(store.filteredTasks().length).toBe(3);
    });

    it('should return only needsAction tasks when filtered', async () => {
      await store.loadTasks('list1');
      store.setFilter('needsAction');
      expect(store.filteredTasks().length).toBe(2);
      expect(store.filteredTasks().every(t => t.status === 'needsAction')).toBeTrue();
    });

    it('should return only completed tasks when filtered', async () => {
      await store.loadTasks('list1');
      store.setFilter('completed');
      expect(store.filteredTasks().length).toBe(1);
      expect(store.filteredTasks()[0].title).toBe('Write tests');
    });
  });

  describe('computed: completionRate', () => {
    it('should return 0 when no tasks', () => {
      expect(store.completionRate()).toBe(0);
    });

    it('should calculate completion percentage', async () => {
      await store.loadTasks('list1');
      // 1 completed out of 3 = 33.33...%
      expect(store.completionRate()).toBeCloseTo(33.33, 1);
    });
  });

  describe('computed: taskCount', () => {
    it('should return 0 when no tasks', () => {
      expect(store.taskCount()).toBe(0);
    });

    it('should return total number of tasks', async () => {
      await store.loadTasks('list1');
      expect(store.taskCount()).toBe(3);
    });
  });

  describe('method: loadTaskLists', () => {
    it('should fetch and store task lists', async () => {
      await store.loadTaskLists();
      expect(store.taskLists()).toEqual(MOCK_LISTS);
      expect(mockTaskService.getTaskLists).toHaveBeenCalled();
    });

    it('should set error on failure', async () => {
      mockTaskService.getTaskLists.and.returnValue(throwError(() => new Error('Network error')));
      await store.loadTaskLists();
      expect(store.error()).toBe('Failed to load task lists');
      expect(store.loading()).toBe(false);
    });
  });

  describe('method: loadTasks', () => {
    it('should set loading while fetching', async () => {
      const loadPromise = store.loadTasks('list1');
      // Loading is set synchronously before the await
      expect(store.loading()).toBe(true);
      await loadPromise;
      expect(store.loading()).toBe(false);
    });

    it('should store fetched tasks', async () => {
      await store.loadTasks('list1');
      expect(store.tasks().length).toBe(3);
      expect(mockTaskService.getTasks).toHaveBeenCalledWith('list1');
    });

    it('should set selectedListId', async () => {
      await store.loadTasks('list1');
      expect(store.selectedListId()).toBe('list1');
    });

    it('should clear error on success', async () => {
      // Trigger an error first, then verify loadTasks clears it
      mockTaskService.getTasks.and.returnValue(throwError(() => new Error('fail')));
      await store.loadTasks('list1');
      expect(store.error()).toBe('Failed to load tasks');

      // Now succeed and verify error is cleared
      mockTaskService.getTasks.and.returnValue(of(MOCK_TASKS));
      await store.loadTasks('list1');
      expect(store.error()).toBeNull();
    });

    it('should set error on failure', async () => {
      mockTaskService.getTasks.and.returnValue(throwError(() => new Error('API error')));
      await store.loadTasks('list1');
      expect(store.error()).toBe('Failed to load tasks');
      expect(store.loading()).toBe(false);
    });
  });

  describe('method: addTask', () => {
    const newTask: Task = {
      id: 't-new', localId: '', title: 'New Task', status: 'needsAction',
      dueDateTime: null, notes: null, meta: null, parent: null,
      position: '00003', updatedDateTime: '2026-02-16T13:00:00Z',
    };

    beforeEach(async () => {
      await store.loadTasks('list1');
      mockTaskService.createTask.and.returnValue(of(newTask));
    });

    it('should add the created task to the store', async () => {
      await store.addTask({ title: 'New Task' });
      expect(store.tasks().length).toBe(4);
      expect(store.tasks().find(t => t.id === 't-new')).toBeTruthy();
    });

    it('should call createTask with correct list and request', async () => {
      await store.addTask({ title: 'New Task' });
      expect(mockTaskService.createTask).toHaveBeenCalledWith('list1', { title: 'New Task' });
    });

  });

  describe('method: addTask (no list selected)', () => {
    it('should set error when no list selected', async () => {
      // selectedListId is null by default (no loadTasks called)
      await store.addTask({ title: 'Orphan' });
      expect(store.error()).toBe('No task list selected');
    });
  });

  describe('method: updateTask', () => {
    const updatedTask: Task = {
      ...MOCK_TASKS[0],
      title: 'Updated groceries',
    };

    beforeEach(async () => {
      await store.loadTasks('list1');
      mockTaskService.updateTask.and.returnValue(of(updatedTask));
    });

    it('should replace the task in the store', async () => {
      await store.updateTask('t1', { title: 'Updated groceries' });
      expect(store.tasks().find(t => t.id === 't1')?.title).toBe('Updated groceries');
    });

    it('should not change other tasks', async () => {
      await store.updateTask('t1', { title: 'Updated groceries' });
      expect(store.tasks().find(t => t.id === 't2')?.title).toBe('Write tests');
    });

    it('should preserve meta when updating only notes', async () => {
      // t2 has meta: { localId: 'uuid-2', tags: ['dev'] }
      await store.updateTask('t2', { notes: 'Updated notes' });

      expect(mockTaskService.updateTask).toHaveBeenCalledWith('list1', 't2', jasmine.objectContaining({
        notes: 'Updated notes',
        meta: { localId: 'uuid-2', tags: ['dev'] }
      }));
    });

    it('should preserve notes when updating only meta', async () => {
      // t1 has notes: 'Milk and eggs'
      await store.updateTask('t1', { meta: { localId: 'uuid-1', tags: ['shopping'] } });

      expect(mockTaskService.updateTask).toHaveBeenCalledWith('list1', 't1', jasmine.objectContaining({
        notes: 'Milk and eggs',
        meta: { localId: 'uuid-1', tags: ['shopping'] }
      }));
    });

    it('should optimistically update task before API responds', async () => {
      const updatePromise = store.updateTask('t1', { title: 'Optimistic Title' });
      expect(store.tasks().find(t => t.id === 't1')?.title).toBe('Optimistic Title');
      await updatePromise;
    });

    it('should rollback on update failure', async () => {
      mockTaskService.updateTask.and.returnValue(throwError(() => new Error('fail')));
      await store.updateTask('t1', { title: 'Fail Title' });
      expect(store.error()).toBe('Failed to update task');
      expect(store.tasks().find(t => t.id === 't1')?.title).toBe('Buy groceries');
    });
  });

  describe('method: removeTask', () => {
    beforeEach(async () => {
      await store.loadTasks('list1');
      mockTaskService.deleteTask.and.returnValue(of(void 0));
    });

    it('should remove the task from the store', async () => {
      await store.removeTask('t1');
      expect(store.tasks().length).toBe(2);
      expect(store.tasks().find(t => t.id === 't1')).toBeUndefined();
    });

    it('should call deleteTask with correct params', async () => {
      await store.removeTask('t1');
      expect(mockTaskService.deleteTask).toHaveBeenCalledWith('list1', 't1');
    });

    it('should optimistically remove task before API responds', async () => {
      const removePromise = store.removeTask('t1');
      expect(store.tasks().find(t => t.id === 't1')).toBeUndefined();
      expect(store.tasks().length).toBe(2);
      await removePromise;
    });

    it('should rollback on delete failure', async () => {
      mockTaskService.deleteTask.and.returnValue(throwError(() => new Error('fail')));
      await store.removeTask('t1');
      expect(store.error()).toBe('Failed to delete task');
      expect(store.tasks().find(t => t.id === 't1')).toBeTruthy();
      expect(store.tasks().length).toBe(3);
    });
  });

  describe('method: toggleTaskStatus', () => {
    beforeEach(async () => {
      await store.loadTasks('list1');
    });

    it('should toggle needsAction to completed', async () => {
      const completed: Task = { ...MOCK_TASKS[0], status: 'completed' };
      mockTaskService.updateTask.and.returnValue(of(completed));

      await store.toggleTaskStatus('t1');
      expect(store.tasks().find(t => t.id === 't1')?.status).toBe('completed');
    });

    it('should toggle completed to needsAction', async () => {
      const uncompleted: Task = { ...MOCK_TASKS[1], status: 'needsAction' };
      mockTaskService.updateTask.and.returnValue(of(uncompleted));

      await store.toggleTaskStatus('t2');
      expect(store.tasks().find(t => t.id === 't2')?.status).toBe('needsAction');
    });

    it('should optimistically toggle before API responds', async () => {
      const completed: Task = { ...MOCK_TASKS[0], status: 'completed' };
      mockTaskService.updateTask.and.returnValue(of(completed));

      const togglePromise = store.toggleTaskStatus('t1');
      expect(store.tasks().find(t => t.id === 't1')?.status).toBe('completed');
      await togglePromise;
    });

    it('should rollback on toggle failure', async () => {
      mockTaskService.updateTask.and.returnValue(throwError(() => new Error('fail')));

      await store.toggleTaskStatus('t1');
      expect(store.error()).toBe('Failed to update task status');
      expect(store.tasks().find(t => t.id === 't1')?.status).toBe('needsAction');
    });
  });

  describe('method: setFilter', () => {
    it('should update the filter', () => {
      store.setFilter('completed');
      expect(store.filter()).toBe('completed');
    });

    it('should update filtered tasks reactively', async () => {
      await store.loadTasks('list1');
      store.setFilter('completed');
      expect(store.filteredTasks().length).toBe(1);
    });
  });

  describe('method: moveTask', () => {
    const movedTask: Task = { ...MOCK_TASKS[0], position: '00005' };

    beforeEach(async () => {
      await store.loadTasks('list1');
      mockTaskService.moveTask.and.returnValue(of(movedTask));
    });

    it('should reorder tasks and update from API', async () => {
      await store.moveTask('t1', { previous: 't3' });

      // Reordered: [t2, t3, t1]
      const ids = store.tasks().map(t => t.id);
      expect(ids).toEqual(['t2', 't3', 't1']);

      // Position updated from API response
      expect(store.tasks().find(t => t.id === 't1')?.position).toBe('00005');
    });

    it('should move task to first position when no previous', async () => {
      const movedT3: Task = { ...MOCK_TASKS[2], position: '00000' };
      mockTaskService.moveTask.and.returnValue(of(movedT3));

      await store.moveTask('t3', {});

      const ids = store.tasks().map(t => t.id);
      expect(ids).toEqual(['t3', 't1', 't2']);
    });

    it('should call moveTask on the service', async () => {
      await store.moveTask('t1', { parent: 'p1', previous: 't3' });
      expect(mockTaskService.moveTask).toHaveBeenCalledWith('list1', 't1', { parent: 'p1', previous: 't3' });
    });

    it('should rollback to server state on move failure', async () => {
      mockTaskService.moveTask.and.returnValue(throwError(() => new Error('API error')));

      await store.moveTask('t1', { previous: 't3' });

      // After rollback, tasks should be reloaded from server
      expect(store.tasks()).toEqual(MOCK_TASKS);
      expect(store.error()).toBe('Failed to move task');
    });
  });
});
