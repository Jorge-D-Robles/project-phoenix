import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';

import type { FocusSession, FocusSettings } from './models/focus-session.model';
import { DEFAULT_FOCUS_SETTINGS } from './models/focus-session.model';
import { DriveAppDataService } from './drive-appdata.service';

const SESSIONS_FILE_NAME = 'focus-sessions.json';
const SETTINGS_FILE_NAME = 'focus-settings.json';

@Injectable({ providedIn: 'root' })
export class FocusService {
  private readonly drive = inject(DriveAppDataService);

  /** Load focus sessions from Google Drive appdata folder */
  loadSessions(): Observable<FocusSession[]> {
    return this.drive.findFile(SESSIONS_FILE_NAME).pipe(
      switchMap(fileId => {
        if (!fileId) {
          return of([] as FocusSession[]);
        }
        return this.drive.downloadFile<FocusSession[]>(fileId);
      }),
    );
  }

  /** Save focus sessions to Google Drive appdata folder */
  saveSessions(sessions: FocusSession[]): Observable<void> {
    return this.drive.findFile(SESSIONS_FILE_NAME).pipe(
      switchMap(fileId => {
        if (fileId) {
          return this.drive.updateFile(fileId, sessions);
        }
        return this.drive.createFile(SESSIONS_FILE_NAME, sessions);
      }),
    );
  }

  /** Load focus settings from Google Drive appdata folder */
  loadSettings(): Observable<FocusSettings> {
    return this.drive.findFile(SETTINGS_FILE_NAME).pipe(
      switchMap(fileId => {
        if (!fileId) {
          return of(DEFAULT_FOCUS_SETTINGS);
        }
        return this.drive.downloadFile<FocusSettings>(fileId);
      }),
    );
  }

  /** Save focus settings to Google Drive appdata folder */
  saveSettings(settings: FocusSettings): Observable<void> {
    return this.drive.findFile(SETTINGS_FILE_NAME).pipe(
      switchMap(fileId => {
        if (fileId) {
          return this.drive.updateFile(fileId, settings);
        }
        return this.drive.createFile(SETTINGS_FILE_NAME, settings);
      }),
    );
  }
}
