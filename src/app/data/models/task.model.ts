/** Phoenix metadata embedded in Google Tasks notes field */
export interface TaskMeta {
  habitId?: string;
  docLinks?: string[];
  tags?: string[];
}

/** Parsed result from TaskParser — separates user notes from Phoenix metadata */
export interface ParsedTaskNotes {
  userNotes: string;
  meta: TaskMeta | null;
}

/** Core Task entity — aggregates Google Tasks API fields with Phoenix metadata */
export interface Task {
  id: string;
  localId: string;
  title: string;
  status: TaskStatus;
  dueDateTime: string | null;
  notes: string | null;
  meta: TaskMeta | null;
  parent: string | null;
  position: string;
  updatedDateTime: string;
}

export type TaskStatus = 'needsAction' | 'completed';

export type TaskFilter = 'ALL' | 'needsAction' | 'completed';

/** Google Tasks API task list resource */
export interface TaskList {
  id: string;
  title: string;
  updatedDateTime: string;
}

/** Shape of a task creation request (fields the user provides) */
export interface CreateTaskRequest {
  title: string;
  notes?: string;
  dueDateTime?: string;
  parent?: string;
}

/** Shape of a task update request (partial fields) */
export interface UpdateTaskRequest {
  title?: string;
  notes?: string;
  status?: TaskStatus;
  dueDateTime?: string | null;
}

/** Parameters for the move operation */
export interface MoveTaskRequest {
  parent?: string;
  previous?: string;
}

/** Google Tasks API response envelope */
export interface TaskListResponse<T> {
  items: T[];
  nextPageToken?: string;
}
