import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Note, NoteColor, NOTE_COLORS, DEFAULT_NOTE_COLOR } from '../../data/models/note.model';

export interface NoteFormData {
  title: string;
  content: string;
  color: NoteColor;
  labels: string[];
}

@Component({
  selector: 'app-note-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="flex flex-col gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <h2 class="text-lg font-semibold">
        {{ note() ? 'Edit Note' : 'New Note' }}
      </h2>

      <mat-form-field appearance="outline">
        <mat-label>Title</mat-label>
        <input matInput
               data-testid="note-title-input"
               [(ngModel)]="title"
               placeholder="Note title" />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Content</mat-label>
        <textarea matInput
                  data-testid="note-content-input"
                  [(ngModel)]="content"
                  rows="6"
                  placeholder="Write your note..."></textarea>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Color</mat-label>
        <mat-select data-testid="note-color-select" [(ngModel)]="color">
          @for (c of colors; track c) {
            <mat-option [value]="c">{{ c }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Labels (comma-separated)</mat-label>
        <input matInput
               data-testid="note-labels-input"
               [(ngModel)]="labelsText"
               placeholder="e.g. work, personal" />
      </mat-form-field>

      <div class="flex gap-2 justify-end">
        <button mat-stroked-button
                data-testid="note-cancel-btn"
                (click)="cancel.emit()">
          Cancel
        </button>
        <button mat-flat-button
                color="primary"
                data-testid="note-save-btn"
                (click)="onSave()">
          Save
        </button>
      </div>
    </div>
  `,
})
export class NoteEditorComponent {
  note = input<Note | null>(null);

  save = output<NoteFormData>();
  cancel = output<void>();

  protected readonly colors = NOTE_COLORS;

  protected title = '';
  protected content = '';
  protected color: NoteColor = DEFAULT_NOTE_COLOR;
  protected labelsText = '';

  constructor() {
    effect(() => {
      const n = this.note();
      if (n) {
        this.title = n.title;
        this.content = n.content;
        this.color = n.color;
        this.labelsText = n.labels.join(', ');
      } else {
        this.title = '';
        this.content = '';
        this.color = DEFAULT_NOTE_COLOR;
        this.labelsText = '';
      }
    });
  }

  protected onSave(): void {
    const labels = this.labelsText
      .split(',')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    this.save.emit({
      title: this.title,
      content: this.content,
      color: this.color,
      labels,
    });
  }
}
