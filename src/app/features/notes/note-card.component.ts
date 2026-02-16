import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NOTE_COLOR_MAP } from '../../data/models/note.model';
import type { Note } from '../../data/models/note.model';

const PREVIEW_MAX_LENGTH = 200;

@Component({
  selector: 'app-note-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatChipsModule, MatIconModule, MatButtonModule],
  template: `
    <div
      data-testid="note-card"
      class="flex flex-col gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700
             cursor-pointer transition-shadow hover:shadow-md"
      [style.backgroundColor]="backgroundColor()"
      (click)="select.emit()"
    >
      <div class="flex items-start justify-between">
        <span data-testid="note-title" class="text-sm font-semibold text-gray-800 truncate flex-1">
          {{ note().title || 'Untitled' }}
        </span>
        <button
          mat-icon-button
          data-testid="note-delete"
          class="!-mt-1 !-mr-1 !w-8 !h-8"
          aria-label="Delete note"
          (click)="onDelete($event)"
        >
          <mat-icon class="!text-base !w-4 !h-4 text-gray-500">close</mat-icon>
        </button>
      </div>

      @if (contentPreview()) {
        <p data-testid="note-preview" class="text-xs text-gray-600 line-clamp-3">
          {{ contentPreview() }}
        </p>
      }

      @if (note().labels.length > 0) {
        <div class="flex flex-wrap gap-1 mt-1">
          @for (label of note().labels; track label) {
            <span
              data-testid="note-label"
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs
                     bg-black/10 text-gray-700"
            >
              {{ label }}
            </span>
          }
        </div>
      }
    </div>
  `,
})
export class NoteCardComponent {
  note = input.required<Note>();

  select = output<void>();
  delete = output<void>();

  protected backgroundColor = computed(() =>
    NOTE_COLOR_MAP[this.note().color] ?? NOTE_COLOR_MAP['DEFAULT'],
  );

  protected contentPreview = computed(() => {
    const raw = this.note().content;
    // Strip HTML tags for preview
    const text = raw.replace(/<[^>]*>/g, '');
    if (text.length > PREVIEW_MAX_LENGTH) {
      return text.substring(0, PREVIEW_MAX_LENGTH) + '...';
    }
    return text;
  });

  protected onDelete(event: Event): void {
    event.stopPropagation();
    this.delete.emit();
  }
}
