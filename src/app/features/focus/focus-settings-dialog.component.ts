import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

import type { FocusSettings } from '../../data/models/focus-session.model';

@Component({
  selector: 'app-focus-settings-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
  ],
  template: `
    <h2 mat-dialog-title>Focus Settings</h2>
    <mat-dialog-content class="flex flex-col gap-4 pt-2">
      <mat-form-field>
        <mat-label>Work duration (minutes)</mat-label>
        <input matInput type="number"
               [(ngModel)]="workDuration"
               min="1" max="60"
               data-testid="settings-work-duration" />
      </mat-form-field>

      <mat-form-field>
        <mat-label>Short break (minutes)</mat-label>
        <input matInput type="number"
               [(ngModel)]="shortBreakDuration"
               min="1" max="30"
               data-testid="settings-short-break" />
      </mat-form-field>

      <mat-form-field>
        <mat-label>Long break (minutes)</mat-label>
        <input matInput type="number"
               [(ngModel)]="longBreakDuration"
               min="1" max="60"
               data-testid="settings-long-break" />
      </mat-form-field>

      <mat-form-field>
        <mat-label>Sessions before long break</mat-label>
        <input matInput type="number"
               [(ngModel)]="sessionsBeforeLongBreak"
               min="1" max="10"
               data-testid="settings-sessions-before-long" />
      </mat-form-field>

      <mat-checkbox [(ngModel)]="autoStartBreaks"
                    data-testid="settings-auto-start-breaks">
        Auto-start breaks
      </mat-checkbox>

      <mat-checkbox [(ngModel)]="autoStartWork"
                    data-testid="settings-auto-start-work">
        Auto-start work sessions
      </mat-checkbox>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close data-testid="settings-cancel">Cancel</button>
      <button mat-flat-button color="primary"
              (click)="save()"
              data-testid="settings-save">
        Save
      </button>
    </mat-dialog-actions>
  `,
})
export class FocusSettingsDialogComponent {
  protected readonly data: FocusSettings = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<FocusSettingsDialogComponent>);

  protected workDuration = this.data.workDuration;
  protected shortBreakDuration = this.data.shortBreakDuration;
  protected longBreakDuration = this.data.longBreakDuration;
  protected sessionsBeforeLongBreak = this.data.sessionsBeforeLongBreak;
  protected autoStartBreaks = this.data.autoStartBreaks;
  protected autoStartWork = this.data.autoStartWork;

  protected save(): void {
    const settings: FocusSettings = {
      workDuration: this.workDuration,
      shortBreakDuration: this.shortBreakDuration,
      longBreakDuration: this.longBreakDuration,
      sessionsBeforeLongBreak: this.sessionsBeforeLongBreak,
      autoStartBreaks: this.autoStartBreaks,
      autoStartWork: this.autoStartWork,
    };
    this.dialogRef.close(settings);
  }
}
