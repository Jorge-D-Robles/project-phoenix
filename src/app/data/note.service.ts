import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, switchMap, map, of, forkJoin } from 'rxjs';

import type {
  Note,
  GoogleDriveFile,
  GoogleDriveFileList,
} from './models/note.model';

const DRIVE_BASE = 'https://www.googleapis.com/drive/v3';
const UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';
const FOLDER_NAME = 'Phoenix_Notes';
const FOLDER_MIME = 'application/vnd.google-apps.folder';
const JSON_MIME = 'application/json';

@Injectable({ providedIn: 'root' })
export class NoteService {
  private readonly http = inject(HttpClient);
  private cachedFolderId: string | null = null;

  /** List all notes from the Phoenix_Notes folder */
  listNotes(): Observable<Note[]> {
    return this.ensureFolder().pipe(
      switchMap(folderId => this.listFilesInFolder(folderId)),
      switchMap(files => {
        if (files.length === 0) return of([]);
        return forkJoin(
          files.map(file => this.downloadNoteContent(file.id)),
        );
      }),
    );
  }

  /** Download and return a single note by its Drive file ID */
  getNote(fileId: string): Observable<Note> {
    return this.downloadNoteContent(fileId);
  }

  /** Create a new note in the Phoenix_Notes folder */
  createNote(note: Omit<Note, 'id'>): Observable<Note> {
    return this.ensureFolder().pipe(
      switchMap(folderId => this.createFileMetadata(folderId)),
      switchMap(file => this.uploadNoteContent(file.id, note)),
    );
  }

  /** Update an existing note file */
  updateNote(fileId: string, note: Omit<Note, 'id'>): Observable<Note> {
    return this.uploadNoteContent(fileId, note);
  }

  /** Delete a note file from Drive */
  deleteNote(fileId: string): Observable<void> {
    return this.http.delete<void>(`${DRIVE_BASE}/files/${fileId}`);
  }

  /** Find the Phoenix_Notes folder, or create it if missing. Caches the folder ID. */
  private ensureFolder(): Observable<string> {
    if (this.cachedFolderId) {
      return of(this.cachedFolderId);
    }

    const query = `name='${FOLDER_NAME}' and mimeType='${FOLDER_MIME}' and trashed=false`;
    const params = new HttpParams()
      .set('q', query)
      .set('fields', 'files(id,name,mimeType)');

    return this.http.get<GoogleDriveFileList>(`${DRIVE_BASE}/files`, { params }).pipe(
      switchMap(res => {
        const folder = res.files?.[0];
        if (folder) {
          this.cachedFolderId = folder.id;
          return of(folder.id);
        }
        return this.createFolder();
      }),
    );
  }

  /** Create the Phoenix_Notes folder in Drive */
  private createFolder(): Observable<string> {
    return this.http.post<GoogleDriveFile>(`${DRIVE_BASE}/files`, {
      name: FOLDER_NAME,
      mimeType: FOLDER_MIME,
    }).pipe(
      map(file => {
        this.cachedFolderId = file.id;
        return file.id;
      }),
    );
  }

  /** List all JSON files in a given folder */
  private listFilesInFolder(folderId: string): Observable<GoogleDriveFile[]> {
    const query = `'${folderId}' in parents and mimeType='${JSON_MIME}' and trashed=false`;
    const params = new HttpParams()
      .set('q', query)
      .set('fields', 'files(id,name,mimeType)');

    return this.http.get<GoogleDriveFileList>(`${DRIVE_BASE}/files`, { params }).pipe(
      map(res => res.files ?? []),
    );
  }

  /** Download the JSON content of a note file */
  private downloadNoteContent(fileId: string): Observable<Note> {
    const params = new HttpParams().set('alt', 'media');
    return this.http.get<Note>(`${DRIVE_BASE}/files/${fileId}`, { params });
  }

  /** Create file metadata for a new note in the given folder */
  private createFileMetadata(folderId: string): Observable<GoogleDriveFile> {
    const name = `note-${crypto.randomUUID()}.json`;
    return this.http.post<GoogleDriveFile>(`${DRIVE_BASE}/files`, {
      name,
      parents: [folderId],
      mimeType: JSON_MIME,
    });
  }

  /** Upload (or overwrite) note content to a Drive file */
  private uploadNoteContent(fileId: string, note: Omit<Note, 'id'>): Observable<Note> {
    const params = new HttpParams().set('uploadType', 'media');
    return this.http.patch<Note>(
      `${UPLOAD_BASE}/files/${fileId}`,
      { ...note, id: fileId },
      {
        params,
        headers: { 'Content-Type': JSON_MIME },
      },
    );
  }
}
