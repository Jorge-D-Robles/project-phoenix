import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { getNoteColor } from '../../data/models/note.model';
import type { Note } from '../../data/models/note.model';
import { stripHtmlAndTruncate } from '../../shared/sanitize-html.util';

const PREVIEW_MAX_LENGTH = 200;

@Component({
  selector: 'app-note-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatChipsModule, MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <div
      data-testid="note-card"
      class="flex flex-col gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700
             cursor-pointer transition-shadow hover:shadow-md"
      [style.backgroundColor]="backgroundColor()"
      (click)="select.emit()"
    >
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-1 flex-1 min-w-0">
          @if (note().pinned) {
            <mat-icon data-testid="pin-indicator" class="!text-sm !w-4 !h-4 text-gray-500 shrink-0">push_pin</mat-icon>
          }
          <span data-testid="note-title" class="text-sm font-semibold text-gray-800 truncate">
            {{ note().title || 'Untitled' }}
          </span>
        </div>
        <div class="flex shrink-0 -mt-1 -mr-1">
          <button
            mat-icon-button
            data-testid="note-pin"
            class="!w-7 !h-7"
            [matTooltip]="(note().pinned ? 'Unpin' : 'Pin') + ' note'"
            (click)="onPin($event)"
          >
            <mat-icon class="!text-sm !w-4 !h-4 text-gray-500">
              {{ note().pinned ? 'push_pin' : 'push_pin' }}
            </mat-icon>
          </button>
          <button
            mat-icon-button
            data-testid="note-archive"
            class="!w-7 !h-7"
            [matTooltip]="(note().archived ? 'Unarchive' : 'Archive') + ' note'"
            (click)="onArchive($event)"
          >
            <mat-icon class="!text-sm !w-4 !h-4 text-gray-500">
              {{ note().archived ? 'unarchive' : 'archive' }}
            </mat-icon>
          </button>
          <button
            mat-icon-button
            data-testid="note-delete"
            class="!w-7 !h-7"
            aria-label="Delete note"
            (click)="onDelete($event)"
          >
            <mat-icon class="!text-sm !w-4 !h-4 text-gray-500">close</mat-icon>
          </button>
        </div>
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

      <p data-testid="note-timestamp" class="text-[10px] text-gray-400 mt-2">
        {{ relativeTime() }}
      </p>
    </div>
  `,
})
export class NoteCardComponent {
  note = input.required<Note>();

  select = output<void>();
  delete = output<void>();
  pin = output<void>();
  archive = output<void>();

  protected readonly backgroundColor = computed(() =>
    getNoteColor(this.note().color),
  );

  protected readonly contentPreview = computed(() =>
    stripHtmlAndTruncate(this.note().content, PREVIEW_MAX_LENGTH),
  );

  protected relativeTime = computed(() => {
    const modified = new Date(this.note().lastModified);
    const now = Date.now();
    const diffMs = now - modified.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return modified.toLocaleDateString();
  });

  protected onDelete(event: Event): void {
    event.stopPropagation();
    this.delete.emit();
  }

  protected onPin(event: Event): void {
    event.stopPropagation();
    this.pin.emit();
  }

  protected onArchive(event: Event): void {
    event.stopPropagation();
    this.archive.emit();
  }
}
