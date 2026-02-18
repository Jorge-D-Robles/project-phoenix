import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { getNoteColor } from '../../data/models/note.model';
import type { Note, NoteColor } from '../../data/models/note.model';
import { stripHtmlAndTruncate } from '../../shared/sanitize-html.util';

const PREVIEW_MAX_LENGTH = 120;

@Component({
  selector: 'app-recent-notes-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatIconModule],
  template: `
    <mat-card data-testid="recent-notes-card" class="h-full">
      <mat-card-header>
        <mat-card-title class="flex items-center gap-2 text-base">
          <mat-icon>sticky_note_2</mat-icon>
          Recent Notes
        </mat-card-title>
      </mat-card-header>
      <mat-card-content class="mt-3">
        @if (notes().length === 0) {
          <p data-testid="empty-state" class="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
            No notes yet
          </p>
        } @else {
          <div class="grid grid-cols-2 gap-2">
            @for (note of notes(); track note.id) {
              <div
                data-testid="note-item"
                class="flex flex-col gap-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                [style.backgroundColor]="getColor(note.color)"
              >
                <span data-testid="note-title" class="text-sm font-medium text-gray-800 truncate">
                  {{ note.title || 'Untitled' }}
                </span>
                @if (getPreview(note.content)) {
                  <p data-testid="note-preview" class="text-xs text-gray-600 line-clamp-2">
                    {{ getPreview(note.content) }}
                  </p>
                }
              </div>
            }
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
})
export class RecentNotesWidgetComponent {
  readonly notes = input.required<Note[]>();

  protected getColor(color: NoteColor): string {
    return getNoteColor(color);
  }

  protected getPreview(content: string): string {
    return stripHtmlAndTruncate(content, PREVIEW_MAX_LENGTH);
  }
}
