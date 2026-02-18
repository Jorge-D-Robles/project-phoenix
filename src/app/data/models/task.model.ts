/** Phoenix metadata embedded in Google Tasks notes field */
export interface TaskMeta {
  readonly localId?: string;
  readonly habitId?: string;
  readonly docLinks?: string[];
  readonly tags?: string[];
}

/** Parsed result from TaskParser — separates user notes from Phoenix metadata */
export interface ParsedTaskNotes {
  readonly userNotes: string;
  readonly meta: TaskMeta | null;
}

/** Core Task entity — aggregates Google Tasks API fields with Phoenix metadata */
export interface Task {
  readonly id: string;
  readonly localId: string;
  readonly title: string;
  readonly status: TaskStatus;
  readonly dueDateTime: string | null;
  readonly notes: string | null;
  readonly meta: TaskMeta | null;
  readonly parent: string | null;
  readonly position: string;
  readonly updatedDateTime: string;
}

export type TaskStatus = 'needsAction' | 'completed';

export type TaskFilter = 'ALL' | 'needsAction' | 'completed';

/** Google Tasks API task list resource */
export interface TaskList {
  readonly id: string;
  readonly title: string;
  readonly updatedDateTime: string;
}

/** Shape of a task creation request (fields the user provides) */
export interface CreateTaskRequest {
  readonly title: string;
  readonly localId?: string;
  readonly notes?: string;
  readonly dueDateTime?: string;
  readonly parent?: string;
}

/** Shape of a task update request (partial fields) */
export interface UpdateTaskRequest {
  readonly title?: string;
  readonly notes?: string;
  readonly status?: TaskStatus;
  readonly dueDateTime?: string | null;
  readonly meta?: TaskMeta | null;
}

/** Parameters for the move operation */
export interface MoveTaskRequest {
  readonly parent?: string;
  readonly previous?: string;
}
