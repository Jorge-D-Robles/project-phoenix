import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { NotesStore } from '../../state/notes.store';
import { NoteCardComponent } from './note-card.component';
import { NoteEditorComponent } from './note-editor.component';
import type { NoteFormData } from './note-editor.component';
import type { Note } from '../../data/models/note.model';

@Component({
  selector: 'app-notes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    NoteCardComponent,
    NoteEditorComponent,
  ],
  template: `
    <div class="p-6 max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Notes</h1>

        @if (store.allLabels().length > 0) {
          <mat-form-field appearance="outline" class="!w-48" subscriptSizing="dynamic">
            <mat-label>Filter by label</mat-label>
            <mat-select
              data-testid="label-filter"
              [ngModel]="store.filterLabel()"
              (ngModelChange)="store.setFilter($event)"
            >
              <mat-option [value]="null">All</mat-option>
              @for (label of store.allLabels(); track label) {
                <mat-option [value]="label">{{ label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        }
      </div>

      <!-- Error state -->
      @if (store.error(); as error) {
        <div data-testid="error-message"
             class="p-4 mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
          {{ error }}
        </div>
      }

      <!-- Editor overlay -->
      @if (showEditor()) {
        <div class="mb-6">
          <app-note-editor
            [note]="editingNote()"
            (save)="onSave($event)"
            (cancel)="onCancelEditor()"
          />
        </div>
      }

      <!-- Loading state -->
      @if (store.loading()) {
        <div class="flex justify-center py-12">
          <mat-spinner diameter="40" />
        </div>
      } @else {
        <!-- Notes grid -->
        @if (store.filteredNotes().length > 0) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
               data-testid="notes-grid">
            @for (note of store.filteredNotes(); track note.id) {
              <app-note-card
                [note]="note"
                (select)="onSelectNote(note)"
                (delete)="onDeleteNote(note.id)"
              />
            }
          </div>
        } @else {
          <div data-testid="empty-state"
               class="text-center py-12 text-gray-400 dark:text-gray-500">
            <mat-icon class="!text-5xl !w-12 !h-12 mb-3">note</mat-icon>
            <p class="text-lg">No notes</p>
            <p class="text-sm mt-1">Create your first note to get started</p>
          </div>
        }
      }

      <!-- FAB -->
      <button mat-fab
              data-testid="add-note-btn"
              color="primary"
              class="!fixed !bottom-8 !right-8"
              aria-label="Add note"
              (click)="onAddNote()">
        <mat-icon>add</mat-icon>
      </button>
    </div>
  `,
})
export class NotesComponent implements OnInit {
  protected readonly store = inject(NotesStore);

  protected showEditor = signal(false);
  protected editingNote = signal<Note | null>(null);

  ngOnInit(): void {
    this.store.loadNotes();
  }

  protected onAddNote(): void {
    this.editingNote.set(null);
    this.showEditor.set(true);
  }

  protected onSelectNote(note: Note): void {
    this.editingNote.set(note);
    this.showEditor.set(true);
    this.store.selectNote(note.id);
  }

  protected onCancelEditor(): void {
    this.showEditor.set(false);
    this.editingNote.set(null);
    this.store.selectNote(null);
  }

  protected onSave(formData: NoteFormData): void {
    const note = this.editingNote();
    if (note) {
      this.store.updateNote(note.id, {
        title: formData.title,
        content: formData.content,
        color: formData.color,
        labels: formData.labels,
      });
    } else {
      const now = new Date().toISOString();
      this.store.addNote({
        title: formData.title,
        content: formData.content,
        color: formData.color,
        labels: formData.labels,
        attachments: [],
        created: now,
        lastModified: now,
      });
    }
    this.showEditor.set(false);
    this.editingNote.set(null);
    this.store.selectNote(null);
  }

  protected onDeleteNote(id: string): void {
    if (window.confirm('Are you sure you want to delete this note?')) {
      this.store.removeNote(id);
    }
  }
}
