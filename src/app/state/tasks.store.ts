import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

import { Task, TaskList, TaskFilter, CreateTaskRequest, UpdateTaskRequest, MoveTaskRequest } from '../data/models/task.model';
import { TaskService } from '../data/task.service';

interface TasksState {
  tasks: Task[];
  taskLists: TaskList[];
  loading: boolean;
  filter: TaskFilter;
  selectedListId: string | null;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  taskLists: [],
  loading: false,
  filter: 'ALL',
  selectedListId: null,
  error: null,
};

export const TasksStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ tasks, filter }) => ({
    filteredTasks: computed(() => {
      const currentFilter = filter();
      return currentFilter === 'ALL'
        ? tasks()
        : tasks().filter(t => t.status === currentFilter);
    }),
    completionRate: computed(() => {
      const all = tasks();
      const total = all.length;
      if (total === 0) return 0;
      const completed = all.filter(t => t.status === 'completed').length;
      return (completed / total) * 100;
    }),
    taskCount: computed(() => tasks().length),
  })),
  withMethods((store, taskService = inject(TaskService)) => ({
    async loadTaskLists(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const lists = await firstValueFrom(taskService.getTaskLists());
        patchState(store, { taskLists: lists, loading: false });
      } catch {
        patchState(store, { error: 'Failed to load task lists', loading: false });
      }
    },

    async loadTasks(listId: string): Promise<void> {
      patchState(store, { loading: true, error: null, selectedListId: listId });
      try {
        const tasks = await firstValueFrom(taskService.getTasks(listId));
        patchState(store, { tasks, loading: false });
      } catch {
        patchState(store, { error: 'Failed to load tasks', loading: false });
      }
    },

    async addTask(request: CreateTaskRequest): Promise<void> {
      const listId = store.selectedListId();
      if (!listId) {
        patchState(store, { error: 'No task list selected' });
        return;
      }
      try {
        const task = await firstValueFrom(taskService.createTask(listId, request));
        patchState(store, { tasks: [...store.tasks(), task], error: null });
      } catch {
        patchState(store, { error: 'Failed to create task' });
      }
    },

    async updateTask(taskId: string, update: UpdateTaskRequest): Promise<void> {
      const listId = store.selectedListId();
      if (!listId) return;

      const task = store.tasks().find((t) => t.id === taskId);
      if (!task) return;

      // If updating notes or meta, ensure the other is preserved since they share the notes field
      const finalUpdate: UpdateTaskRequest = { ...update };
      if (update.notes !== undefined && update.meta === undefined) {
        finalUpdate.meta = task.meta;
      } else if (update.meta !== undefined && update.notes === undefined) {
        finalUpdate.notes = task.notes || '';
      }

      try {
        const updated = await firstValueFrom(taskService.updateTask(listId, taskId, finalUpdate));
        patchState(store, {
          tasks: store.tasks().map((t) => (t.id === taskId ? updated : t)),
          error: null,
        });
      } catch {
        patchState(store, { error: 'Failed to update task' });
      }
    },

    async removeTask(taskId: string): Promise<void> {
      const listId = store.selectedListId();
      if (!listId) return;
      try {
        await firstValueFrom(taskService.deleteTask(listId, taskId));
        patchState(store, {
          tasks: store.tasks().filter(t => t.id !== taskId),
          error: null,
        });
      } catch {
        patchState(store, { error: 'Failed to delete task' });
      }
    },

    async toggleTaskStatus(taskId: string): Promise<void> {
      const task = store.tasks().find(t => t.id === taskId);
      if (!task) return;
      const newStatus = task.status === 'needsAction' ? 'completed' : 'needsAction';
      const listId = store.selectedListId();
      if (!listId) return;
      try {
        const updated = await firstValueFrom(
          taskService.updateTask(listId, taskId, { status: newStatus }),
        );
        patchState(store, {
          tasks: store.tasks().map(t => t.id === taskId ? updated : t),
          error: null,
        });
      } catch {
        patchState(store, { error: 'Failed to update task status' });
      }
    },

    async moveTask(taskId: string, request: MoveTaskRequest): Promise<void> {
      const listId = store.selectedListId();
      if (!listId) return;

      // Optimistic reorder
      const currentTasks = [...store.tasks()];
      const taskIdx = currentTasks.findIndex(t => t.id === taskId);
      if (taskIdx === -1) return;

      const [task] = currentTasks.splice(taskIdx, 1);
      if (request.previous) {
        const prevIdx = currentTasks.findIndex(t => t.id === request.previous);
        currentTasks.splice(prevIdx + 1, 0, task);
      } else {
        currentTasks.unshift(task);
      }
      patchState(store, { tasks: currentTasks });

      try {
        const moved = await firstValueFrom(taskService.moveTask(listId, taskId, request));
        patchState(store, {
          tasks: store.tasks().map(t => t.id === taskId ? moved : t),
          error: null,
        });
      } catch {
        // Rollback: reload from server
        try {
          const tasks = await firstValueFrom(taskService.getTasks(listId));
          patchState(store, { tasks, error: 'Failed to move task' });
        } catch {
          patchState(store, { error: 'Failed to move task' });
        }
      }
    },

    setFilter(filter: TaskFilter): void {
      patchState(store, { filter });
    },
  })),
);
