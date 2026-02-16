import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, expand, reduce, EMPTY, map } from 'rxjs';

import {
  Task,
  TaskList,
  CreateTaskRequest,
  UpdateTaskRequest,
  MoveTaskRequest,
  TaskMeta,
} from './models/task.model';
import { TaskParser } from './task.parser';

const BASE_URL = 'https://tasks.googleapis.com/tasks/v1';

interface GoogleTask {
  id: string;
  title: string;
  status: string;
  due?: string;
  notes?: string;
  parent?: string;
  position: string;
  updated: string;
}

interface GoogleTaskListResponse {
  items?: GoogleTask[];
  nextPageToken?: string;
}

interface GoogleTaskListsResponse {
  items?: Array<{ id: string; title: string; updated: string }>;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);

  getTaskLists(): Observable<TaskList[]> {
    return this.http
      .get<GoogleTaskListsResponse>(`${BASE_URL}/users/@me/lists`)
      .pipe(map(res => (res.items ?? []).map(item => ({
        id: item.id,
        title: item.title,
        updatedDateTime: item.updated,
      }))));
  }

  getTasks(listId: string): Observable<Task[]> {
    return this.fetchAllPages(listId);
  }

  createTask(listId: string, request: CreateTaskRequest): Observable<Task> {
    let params = new HttpParams();
    if (request.parent) {
      params = params.set('parent', request.parent);
    }

    const body: Record<string, string | undefined> = {
      title: request.title,
      notes: request.notes,
      due: request.dueDateTime,
    };

    return this.http
      .post<GoogleTask>(`${BASE_URL}/lists/${listId}/tasks`, body, { params })
      .pipe(map(raw => this.mapTask(raw)));
  }

  updateTask(listId: string, taskId: string, update: UpdateTaskRequest): Observable<Task> {
    const body: Record<string, string | null | undefined> = {};
    if (update.title !== undefined) body['title'] = update.title;
    if (update.status !== undefined) body['status'] = update.status;
    if (update.notes !== undefined) body['notes'] = update.notes;
    if (update.dueDateTime !== undefined) body['due'] = update.dueDateTime;

    return this.http
      .patch<GoogleTask>(`${BASE_URL}/lists/${listId}/tasks/${taskId}`, body)
      .pipe(map(raw => this.mapTask(raw)));
  }

  deleteTask(listId: string, taskId: string): Observable<void> {
    return this.http.delete<void>(`${BASE_URL}/lists/${listId}/tasks/${taskId}`);
  }

  moveTask(listId: string, taskId: string, request: MoveTaskRequest): Observable<Task> {
    let params = new HttpParams();
    if (request.parent) {
      params = params.set('parent', request.parent);
    }
    if (request.previous) {
      params = params.set('previous', request.previous);
    }

    return this.http
      .post<GoogleTask>(`${BASE_URL}/lists/${listId}/tasks/${taskId}/move`, null, { params })
      .pipe(map(raw => this.mapTask(raw)));
  }

  private fetchAllPages(listId: string): Observable<Task[]> {
    const fetchPage = (pageToken?: string) => {
      let params = new HttpParams().set('showCompleted', 'true');
      if (pageToken) {
        params = params.set('pageToken', pageToken);
      }
      return this.http.get<GoogleTaskListResponse>(
        `${BASE_URL}/lists/${listId}/tasks`,
        { params },
      );
    };

    return fetchPage().pipe(
      expand(res => res.nextPageToken ? fetchPage(res.nextPageToken) : EMPTY),
      reduce((acc: Task[], res) => {
        const tasks = (res.items ?? []).map(raw => this.mapTask(raw));
        return [...acc, ...tasks];
      }, []),
    );
  }

  private mapTask(raw: GoogleTask): Task {
    const parsed = TaskParser.parse(raw.notes ?? null);
    return {
      id: raw.id,
      localId: '',
      title: raw.title,
      status: raw.status as 'needsAction' | 'completed',
      dueDateTime: raw.due ?? null,
      notes: parsed.userNotes || null,
      meta: parsed.meta,
      parent: raw.parent ?? null,
      position: raw.position,
      updatedDateTime: raw.updated,
    };
  }
}
