import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, switchMap, map } from 'rxjs';

import type { FocusSession, FocusSettings } from './models/focus-session.model';
import { DEFAULT_FOCUS_SETTINGS } from './models/focus-session.model';
import type { GoogleDriveFileList } from './models/habit.model';

const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';
const SESSIONS_FILE_NAME = 'focus-sessions.json';
const SETTINGS_FILE_NAME = 'focus-settings.json';

@Injectable({ providedIn: 'root' })
export class FocusService {
  private readonly http = inject(HttpClient);

  /** Load focus sessions from Google Drive appdata folder */
  loadSessions(): Observable<FocusSession[]> {
    return this.findFile(SESSIONS_FILE_NAME).pipe(
      switchMap(fileId => {
        if (!fileId) {
          return of([] as FocusSession[]);
        }
        return this.downloadFile<FocusSession[]>(fileId);
      }),
    );
  }

  /** Save focus sessions to Google Drive appdata folder */
  saveSessions(sessions: FocusSession[]): Observable<void> {
    return this.findFile(SESSIONS_FILE_NAME).pipe(
      switchMap(fileId => {
        if (fileId) {
          return this.updateFile(fileId, sessions);
        }
        return this.createFile(SESSIONS_FILE_NAME, sessions);
      }),
    );
  }

  /** Load focus settings from Google Drive appdata folder */
  loadSettings(): Observable<FocusSettings> {
    return this.findFile(SETTINGS_FILE_NAME).pipe(
      switchMap(fileId => {
        if (!fileId) {
          return of(DEFAULT_FOCUS_SETTINGS);
        }
        return this.downloadFile<FocusSettings>(fileId);
      }),
    );
  }

  /** Save focus settings to Google Drive appdata folder */
  saveSettings(settings: FocusSettings): Observable<void> {
    return this.findFile(SETTINGS_FILE_NAME).pipe(
      switchMap(fileId => {
        if (fileId) {
          return this.updateFile(fileId, settings);
        }
        return this.createFile(SETTINGS_FILE_NAME, settings);
      }),
    );
  }

  /** Search for a file by name in the appDataFolder */
  private findFile(fileName: string): Observable<string | null> {
    const params = new HttpParams()
      .set('spaces', 'appDataFolder')
      .set('q', `name='${fileName}'`);

    return this.http.get<GoogleDriveFileList>(DRIVE_FILES_URL, { params }).pipe(
      map(response => {
        const files = response.files;
        if (files && files.length > 0) {
          return files[0].id;
        }
        return null;
      }),
    );
  }

  /** Download file content by file ID */
  private downloadFile<T>(fileId: string): Observable<T> {
    const params = new HttpParams().set('alt', 'media');
    return this.http.get<T>(`${DRIVE_FILES_URL}/${fileId}`, { params });
  }

  /** Update existing file via PATCH */
  private updateFile(fileId: string, data: unknown): Observable<void> {
    const params = new HttpParams().set('uploadType', 'media');
    return this.http.patch<void>(
      `${DRIVE_UPLOAD_URL}/${fileId}`,
      data,
      {
        params,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  /** Create new file in appDataFolder via multipart POST */
  private createFile(fileName: string, data: unknown): Observable<void> {
    const metadata = {
      name: fileName,
      parents: ['appDataFolder'],
      mimeType: 'application/json',
    };

    const boundary = '===phoenix_boundary===';
    const body =
      `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      `${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: application/json\r\n\r\n` +
      `${JSON.stringify(data)}\r\n` +
      `--${boundary}--`;

    const params = new HttpParams().set('uploadType', 'multipart');
    return this.http.post<void>(
      DRIVE_UPLOAD_URL,
      body,
      {
        params,
        headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      },
    );
  }
}
