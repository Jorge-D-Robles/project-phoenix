import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import type { GoogleDriveFileList } from './models/google-drive.model';

const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';
const BOUNDARY = '===phoenix_boundary===';

/** Shared service for Google Drive Application Data folder operations */
@Injectable({ providedIn: 'root' })
export class DriveAppDataService {
  private readonly http = inject(HttpClient);

  /** Search for a file by name in the appDataFolder */
  findFile(fileName: string): Observable<string | null> {
    const params = new HttpParams()
      .set('spaces', 'appDataFolder')
      .set('q', `name='${fileName}'`);

    return this.http.get<GoogleDriveFileList>(DRIVE_FILES_URL, { params }).pipe(
      map(response => response.files?.[0]?.id ?? null),
    );
  }

  /** Download file content by file ID */
  downloadFile<T>(fileId: string): Observable<T> {
    const params = new HttpParams().set('alt', 'media');
    return this.http.get<T>(`${DRIVE_FILES_URL}/${fileId}`, { params });
  }

  /** Update existing file via PATCH */
  updateFile(fileId: string, data: unknown): Observable<void> {
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
  createFile(fileName: string, data: unknown): Observable<void> {
    const metadata = {
      name: fileName,
      parents: ['appDataFolder'],
      mimeType: 'application/json',
    };

    const body =
      `--${BOUNDARY}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      `${JSON.stringify(metadata)}\r\n` +
      `--${BOUNDARY}\r\n` +
      `Content-Type: application/json\r\n\r\n` +
      `${JSON.stringify(data)}\r\n` +
      `--${BOUNDARY}--`;

    const params = new HttpParams().set('uploadType', 'multipart');
    return this.http.post<void>(
      DRIVE_UPLOAD_URL,
      body,
      {
        params,
        headers: { 'Content-Type': `multipart/related; boundary=${BOUNDARY}` },
      },
    );
  }
}
