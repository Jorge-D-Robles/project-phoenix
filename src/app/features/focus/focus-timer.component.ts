import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';

import { FocusStore } from '../../state/focus.store';
import { FocusSettingsDialogComponent } from './focus-settings-dialog.component';
import type { FocusSettings } from '../../data/models/focus-session.model';

@Component({
  selector: 'app-focus-timer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <div class="flex items-center gap-1">
      @if (isIdle()) {
        <button mat-icon-button
                data-testid="focus-start-btn"
                matTooltip="Start Focus Session"
                (click)="onStart()">
          <mat-icon>play_arrow</mat-icon>
        </button>
        <span class="text-sm font-medium hidden sm:inline" data-testid="focus-label">Focus</span>
      }

      @if (isRunning() || isPaused()) {
        <span class="text-sm font-mono font-medium tabular-nums"
              data-testid="focus-timer-display"
              [class.text-yellow-500]="isPaused()">
          {{ formattedTime() }}
        </span>

        @if (linkedTaskTitle()) {
          <span class="text-xs text-gray-500 dark:text-gray-400 max-w-24 truncate hidden sm:inline"
                data-testid="focus-linked-task"
                [matTooltip]="linkedTaskTitle()!">
            {{ linkedTaskTitle() }}
          </span>
        }

        @if (isRunning()) {
          <button mat-icon-button
                  data-testid="focus-pause-btn"
                  matTooltip="Pause"
                  (click)="onPause()">
            <mat-icon>pause</mat-icon>
          </button>
        }

        @if (isPaused()) {
          <button mat-icon-button
                  data-testid="focus-resume-btn"
                  matTooltip="Resume"
                  (click)="onResume()">
            <mat-icon>play_arrow</mat-icon>
          </button>
        }

        <button mat-icon-button
                data-testid="focus-stop-btn"
                matTooltip="Stop"
                (click)="onStop()">
          <mat-icon>stop</mat-icon>
        </button>
      }

      @if (linkedTaskId()) {
        <button mat-icon-button
                data-testid="focus-unlink-btn"
                matTooltip="Unlink task"
                (click)="onUnlink()">
          <mat-icon>link_off</mat-icon>
        </button>
      }

      <button mat-icon-button
              data-testid="focus-settings-btn"
              matTooltip="Focus settings"
              (click)="onOpenSettings()">
        <mat-icon>settings</mat-icon>
      </button>
    </div>
  `,
})
export class FocusTimerComponent {
  private readonly store = inject(FocusStore);
  private readonly dialog = inject(MatDialog);

  protected readonly isIdle = computed(() => this.store.timerStatus() === 'IDLE');
  protected readonly isRunning = computed(() => this.store.timerStatus() === 'RUNNING');
  protected readonly isPaused = computed(() => this.store.timerStatus() === 'PAUSED');
  protected readonly linkedTaskId = computed(() => this.store.linkedTaskId());
  protected readonly linkedTaskTitle = computed(() => this.store.linkedTaskTitle());

  protected readonly formattedTime = computed(() => {
    const totalSeconds = this.store.remainingSeconds();
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  protected onStart(): void {
    this.store.requestNotificationPermission();
    this.store.startTimer();
  }

  protected onPause(): void {
    this.store.pauseTimer();
  }

  protected onResume(): void {
    this.store.resumeTimer();
  }

  protected onStop(): void {
    this.store.stopTimer();
  }

  protected onUnlink(): void {
    this.store.unlinkTask();
  }

  protected onOpenSettings(): void {
    const dialogRef = this.dialog.open(FocusSettingsDialogComponent, {
      data: this.store.settings(),
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result: FocusSettings | undefined) => {
      if (result) {
        this.store.updateSettings(result);
      }
    });
  }
}
