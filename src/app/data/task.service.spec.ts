import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { TaskService } from './task.service';
import type { CreateTaskRequest, Task, TaskList, UpdateTaskRequest } from './models/task.model';

describe('TaskService', () => {
  let service: TaskService;
  let httpTesting: HttpTestingController;

  const BASE_URL = 'https://tasks.googleapis.com/tasks/v1';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TaskService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(TaskService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('getTaskLists', () => {
    it('should fetch all task lists', () => {
      const expected: TaskList[] = [
        { id: 'list1', title: 'My Tasks', updatedDateTime: '2026-01-01T00:00:00Z' },
      ];

      service.getTaskLists().subscribe(lists => {
        expect(lists).toEqual(expected);
      });

      const req = httpTesting.expectOne(`${BASE_URL}/users/@me/lists`);
      expect(req.request.method).toBe('GET');
      req.flush({ items: [{ id: 'list1', title: 'My Tasks', updated: '2026-01-01T00:00:00Z' }] });
    });

    it('should return empty array when no items in response', () => {
      service.getTaskLists().subscribe(lists => {
        expect(lists).toEqual([]);
      });

      const req = httpTesting.expectOne(`${BASE_URL}/users/@me/lists`);
      req.flush({});
    });
  });

  describe('getTasks', () => {
    it('should fetch tasks for a given list', () => {
      const mockTasks: Task[] = [
        {
          id: 't1', localId: '', title: 'Task 1', status: 'needsAction',
          dueDateTime: null, notes: null, meta: null, parent: null,
          position: '00000', updatedDateTime: '2026-01-01T00:00:00Z',
        },
      ];

      service.getTasks('list1').subscribe(tasks => {
        expect(tasks.length).toBe(1);
        expect(tasks[0].title).toBe('Task 1');
        expect(tasks[0].localId).toBe('t1'); // Fallback to id
      });

      const req = httpTesting.expectOne(
        r => r.url === `${BASE_URL}/lists/list1/tasks` && r.params.get('showCompleted') === 'true'
      );
      expect(req.request.method).toBe('GET');
      req.flush({ items: mockTasks });
    });

    it('should return empty array when no tasks exist', () => {
      service.getTasks('list1').subscribe(tasks => {
        expect(tasks).toEqual([]);
      });

      const req = httpTesting.expectOne(r => r.url === `${BASE_URL}/lists/list1/tasks`);
      req.flush({});
    });

    it('should extract localId from metadata if present', () => {
      const mockTasks = [
        {
          id: 't1', title: 'Task 1', status: 'needsAction', position: '00000', updated: '2026-01-01T00:00:00Z',
          notes: 'User notes\n---PHOENIX_META---\n{"localId":"persistent-uuid"}',
        },
      ];

      service.getTasks('list1').subscribe(tasks => {
        expect(tasks[0].localId).toBe('persistent-uuid');
        expect(tasks[0].notes).toBe('User notes');
      });

      const req = httpTesting.expectOne(r => r.url === `${BASE_URL}/lists/list1/tasks`);
      req.flush({ items: mockTasks });
    });

    it('should handle pagination and fetch all pages', () => {
      const page1Tasks = [
        { id: 't1', title: 'Task 1', status: 'needsAction', position: '00000', updatedDateTime: '2026-01-01T00:00:00Z' },
      ];
      const page2Tasks = [
        { id: 't2', title: 'Task 2', status: 'needsAction', position: '00001', updatedDateTime: '2026-01-01T00:00:00Z' },
      ];

      service.getTasks('list1').subscribe(tasks => {
        expect(tasks.length).toBe(2);
        expect(tasks[0].title).toBe('Task 1');
        expect(tasks[1].title).toBe('Task 2');
      });

      const req1 = httpTesting.expectOne(r => r.url === `${BASE_URL}/lists/list1/tasks` && !r.params.has('pageToken'));
      req1.flush({ items: page1Tasks, nextPageToken: 'token-2' });

      const req2 = httpTesting.expectOne(r => r.url === `${BASE_URL}/lists/list1/tasks` && r.params.get('pageToken') === 'token-2');
      req2.flush({ items: page2Tasks });
    });
  });

  describe('createTask', () => {
    it('should POST a new task to the list with a generated localId', () => {
      const request: CreateTaskRequest = { title: 'New Task' };
      const response = {
        id: 't-new', title: 'New Task', status: 'needsAction',
        position: '00000', updated: '2026-01-01T00:00:00Z',
        notes: '\n---PHOENIX_META---\n{"localId":"uuid-123"}',
      };

      service.createTask('list1', request).subscribe(task => {
        expect(task.id).toBe('t-new');
        expect(task.localId).toBe('uuid-123');
        expect(task.title).toBe('New Task');
      });

      const req = httpTesting.expectOne(`${BASE_URL}/lists/list1/tasks`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.title).toBe('New Task');
      expect(req.request.body.notes).toContain('---PHOENIX_META---');
      expect(req.request.body.notes).toContain('localId');
      req.flush(response);
    });

    it('should set parent when creating a subtask', () => {
      const request: CreateTaskRequest = { title: 'Subtask', parent: 'parent-1' };

      service.createTask('list1', request).subscribe();

      const req = httpTesting.expectOne(
        r => r.url === `${BASE_URL}/lists/list1/tasks` && r.params.get('parent') === 'parent-1'
      );
      expect(req.request.method).toBe('POST');
      req.flush({ id: 't-sub', title: 'Subtask', status: 'needsAction', position: '00000', updated: '2026-01-01T00:00:00Z' });
    });
  });

  describe('updateTask', () => {
    it('should PATCH an existing task', () => {
      const update: UpdateTaskRequest = { title: 'Updated Title' };

      service.updateTask('list1', 't1', update).subscribe(task => {
        expect(task.title).toBe('Updated Title');
      });

      const req = httpTesting.expectOne(`${BASE_URL}/lists/list1/tasks/t1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body.title).toBe('Updated Title');
      req.flush({ id: 't1', title: 'Updated Title', status: 'needsAction', position: '00000', updated: '2026-01-01T00:00:00Z' });
    });

    it('should update task status to completed', () => {
      const update: UpdateTaskRequest = { status: 'completed' };

      service.updateTask('list1', 't1', update).subscribe(task => {
        expect(task.status).toBe('completed');
      });

      const req = httpTesting.expectOne(`${BASE_URL}/lists/list1/tasks/t1`);
      expect(req.request.body.status).toBe('completed');
      req.flush({ id: 't1', title: 'Task', status: 'completed', position: '00000', updated: '2026-01-01T00:00:00Z' });
    });
  });

  describe('deleteTask', () => {
    it('should DELETE a task by ID', () => {
      service.deleteTask('list1', 't1').subscribe();

      const req = httpTesting.expectOne(`${BASE_URL}/lists/list1/tasks/t1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('moveTask', () => {
    it('should POST move with parent and previous params', () => {
      service.moveTask('list1', 't1', { parent: 'p1', previous: 'prev1' }).subscribe(task => {
        expect(task.id).toBe('t1');
      });

      const req = httpTesting.expectOne(
        r => r.url === `${BASE_URL}/lists/list1/tasks/t1/move`
          && r.params.get('parent') === 'p1'
          && r.params.get('previous') === 'prev1'
      );
      expect(req.request.method).toBe('POST');
      req.flush({ id: 't1', title: 'Task', status: 'needsAction', position: '00000', updated: '2026-01-01T00:00:00Z' });
    });

    it('should move to top-level without parent', () => {
      service.moveTask('list1', 't1', { previous: 'prev1' }).subscribe(task => {
        expect(task.id).toBe('t1');
      });

      const req = httpTesting.expectOne(
        r => r.url === `${BASE_URL}/lists/list1/tasks/t1/move`
          && !r.params.has('parent')
          && r.params.get('previous') === 'prev1'
      );
      expect(req.request.method).toBe('POST');
      req.flush({ id: 't1', title: 'Task', status: 'needsAction', position: '00000', updated: '2026-01-01T00:00:00Z' });
    });

    it('should move to first position without previous', () => {
      service.moveTask('list1', 't1', {}).subscribe(task => {
        expect(task.id).toBe('t1');
      });

      const req = httpTesting.expectOne(
        r => r.url === `${BASE_URL}/lists/list1/tasks/t1/move`
          && !r.params.has('parent')
          && !r.params.has('previous')
      );
      expect(req.request.method).toBe('POST');
      req.flush({ id: 't1', title: 'Task', status: 'needsAction', position: '00000', updated: '2026-01-01T00:00:00Z' });
    });
  });
});
