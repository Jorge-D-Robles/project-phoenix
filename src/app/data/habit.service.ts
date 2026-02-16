import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, switchMap, map } from 'rxjs';

import { HabitsData, GoogleDriveFileList } from './models/habit.model';

const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';
const HABITS_FILE_NAME = 'habits.json';

const EMPTY_DATA: HabitsData = { habits: [], logs: [] };

@Injectable({ providedIn: 'root' })
export class HabitService {
  private readonly http = inject(HttpClient);

  /** Load habits data from Google Drive appdata folder */
  loadData(): Observable<HabitsData> {
    return this.findHabitsFile().pipe(
      switchMap(fileId => {
        if (!fileId) {
          return of(EMPTY_DATA);
        }
        return this.downloadFile(fileId);
      }),
    );
  }

  /** Save habits data to Google Drive appdata folder */
  saveData(data: HabitsData): Observable<void> {
    return this.findHabitsFile().pipe(
      switchMap(fileId => {
        if (fileId) {
          return this.updateFile(fileId, data);
        }
        return this.createFile(data);
      }),
    );
  }

  /** Search for habits.json in the appDataFolder */
  private findHabitsFile(): Observable<string | null> {
    const params = new HttpParams()
      .set('spaces', 'appDataFolder')
      .set('q', `name='${HABITS_FILE_NAME}'`);

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

  /** Download habits.json content by file ID */
  private downloadFile(fileId: string): Observable<HabitsData> {
    const params = new HttpParams().set('alt', 'media');
    return this.http.get<HabitsData>(`${DRIVE_FILES_URL}/${fileId}`, { params });
  }

  /** Update existing habits.json via PATCH */
  private updateFile(fileId: string, data: HabitsData): Observable<void> {
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

  /** Create new habits.json in appDataFolder via multipart POST */
  private createFile(data: HabitsData): Observable<void> {
    const metadata = {
      name: HABITS_FILE_NAME,
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
