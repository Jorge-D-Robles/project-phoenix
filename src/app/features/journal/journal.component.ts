import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { JournalStore } from '../../state/journal.store';
import type { Note } from '../../data/models/note.model';

@Component({
  selector: 'app-journal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatListModule, FormsModule],
  template: `
    <div class="p-6 max-w-6xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <mat-icon class="text-primary">auto_stories</mat-icon>
        <h1 class="text-2xl font-semibold">Daily Journal</h1>
        <span class="flex-1"></span>
        <button mat-stroked-button (click)="goToToday()" data-testid="today-btn">
          <mat-icon>today</mat-icon>
          Today
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        <!-- Sidebar: past entries -->
        <mat-card data-testid="entries-list">
          <mat-card-header>
            <mat-card-title class="text-base">Entries</mat-card-title>
          </mat-card-header>
          <mat-card-content class="mt-2">
            <mat-nav-list dense>
              @for (entry of journalStore.allEntries(); track entry.id) {
                <a mat-list-item
                   [class.!bg-primary/10]="selectedEntry()?.id === entry.id"
                   (click)="selectEntry(entry)"
                   data-testid="entry-item">
                  <span matListItemTitle>{{ entry.title }}</span>
                  <span matListItemLine class="text-xs text-gray-500">
                    {{ entry.content.length > 0 ? (entry.content.length + ' chars') : 'Empty' }}
                  </span>
                </a>
              } @empty {
                <p class="text-sm text-gray-500 text-center py-4">No entries yet</p>
              }
            </mat-nav-list>
          </mat-card-content>
        </mat-card>

        <!-- Main: editor -->
        <mat-card data-testid="editor-card">
          <mat-card-header>
            <mat-card-title class="text-base">
              {{ selectedEntry()?.title ?? 'Select an entry' }}
            </mat-card-title>
          </mat-card-header>
          <mat-card-content class="mt-2">
            @if (selectedEntry()) {
              <textarea
                data-testid="journal-editor"
                class="w-full min-h-[400px] p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent resize-y text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                [ngModel]="editorContent()"
                (ngModelChange)="onContentChange($event)"
                (blur)="saveContent()"
                placeholder="Write your thoughts...">
              </textarea>
            } @else {
              <p class="text-sm text-gray-500 py-8 text-center">
                Select a journal entry from the sidebar or click "Today" to start writing.
              </p>
            }
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
})
export class JournalComponent implements OnInit {
  protected readonly journalStore = inject(JournalStore);
  protected readonly selectedEntry = signal<Note | null>(null);
  protected readonly editorContent = signal('');

  private saveTimeoutId: ReturnType<typeof setTimeout> | null = null;

  async ngOnInit(): Promise<void> {
    await this.goToToday();
  }

  protected async goToToday(): Promise<void> {
    try {
      const entry = await this.journalStore.ensureTodayEntry();
      if (entry) {
        this.selectEntry(entry);
      }
    } catch {
      // Journal entry creation failed — stay on empty state
    }
  }

  protected selectEntry(entry: Note): void {
    this.selectedEntry.set(entry);
    this.editorContent.set(entry.content);
  }

  protected onContentChange(content: string): void {
    this.editorContent.set(content);
    // Auto-save after 2s debounce
    if (this.saveTimeoutId) clearTimeout(this.saveTimeoutId);
    this.saveTimeoutId = setTimeout(() => this.saveContent(), 2000);
  }

  protected saveContent(): void {
    if (this.saveTimeoutId) {
      clearTimeout(this.saveTimeoutId);
      this.saveTimeoutId = null;
    }
    const entry = this.selectedEntry();
    const content = this.editorContent();
    if (entry && content !== entry.content) {
      this.journalStore.updateEntry(entry.id, content);
    }
  }
}
