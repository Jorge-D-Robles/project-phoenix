import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import type { Task } from '../../data/models/task.model';

export interface TaskDialogData {
  mode: 'create' | 'edit';
  task?: Task;
}

@Component({
  selector: 'app-task-detail-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'New Task' : 'Edit Task' }}</h2>
    <mat-dialog-content class="flex flex-col gap-4 pt-2">
      <mat-form-field>
        <mat-label>Title</mat-label>
        <input matInput [(ngModel)]="title" data-testid="task-title-input" />
      </mat-form-field>

      <mat-form-field>
        <mat-label>Notes</mat-label>
        <textarea matInput [(ngModel)]="notes" rows="3" data-testid="task-notes-input"></textarea>
      </mat-form-field>

      <mat-form-field>
        <mat-label>Due date</mat-label>
        <input matInput [matDatepicker]="picker" [(ngModel)]="dueDate" data-testid="task-due-input" />
        <mat-datepicker-toggle matIconSuffix [for]="picker" />
        <mat-datepicker #picker />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close data-testid="dialog-cancel">Cancel</button>
      <button mat-flat-button color="primary" (click)="save()"
              [disabled]="!title.trim()" data-testid="dialog-save">
        {{ data.mode === 'create' ? 'Create' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class TaskDetailDialogComponent {
  protected readonly data: TaskDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<TaskDetailDialogComponent>);

  protected title = this.data.task?.title ?? '';
  protected notes = this.data.task?.notes ?? '';
  protected dueDate: Date | null = this.data.task?.dueDateTime ? new Date(this.data.task.dueDateTime) : null;

  protected save(): void {
    if (!this.title.trim()) return;

    const dueDateIso = this.dueDate ? this.dueDate.toISOString() : null;

    if (this.data.mode === 'create') {
      this.dialogRef.close({
        title: this.title.trim(),
        notes: this.notes || undefined,
        dueDateTime: dueDateIso || undefined,
      });
    } else {
      this.dialogRef.close({
        title: this.title.trim(),
        notes: this.notes || undefined,
        dueDateTime: dueDateIso,
      });
    }
  }
}
