import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';

import type { HabitsData } from './models/habit.model';
import { DriveAppDataService } from './drive-appdata.service';

const HABITS_FILE_NAME = 'habits.json';
const EMPTY_DATA: HabitsData = { habits: [], logs: [] };

@Injectable({ providedIn: 'root' })
export class HabitService {
  private readonly drive = inject(DriveAppDataService);

  /** Load habits data from Google Drive appdata folder */
  loadData(): Observable<HabitsData> {
    return this.drive.findFile(HABITS_FILE_NAME).pipe(
      switchMap(fileId => {
        if (!fileId) {
          return of(EMPTY_DATA);
        }
        return this.drive.downloadFile<HabitsData>(fileId);
      }),
    );
  }

  /** Save habits data to Google Drive appdata folder */
  saveData(data: HabitsData): Observable<void> {
    return this.drive.findFile(HABITS_FILE_NAME).pipe(
      switchMap(fileId => {
        if (fileId) {
          return this.drive.updateFile(fileId, data);
        }
        return this.drive.createFile(HABITS_FILE_NAME, data);
      }),
    );
  }
}
