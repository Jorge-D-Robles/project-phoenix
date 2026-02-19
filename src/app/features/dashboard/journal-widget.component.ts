import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { JournalStore } from '../../state/journal.store';

@Component({
  selector: 'app-journal-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <mat-card data-testid="journal-card" class="h-full">
      <mat-card-header>
        <mat-card-title class="flex items-center gap-2 text-base">
          <mat-icon>auto_stories</mat-icon>
          Today's Journal
        </mat-card-title>
      </mat-card-header>
      <mat-card-content class="mt-3">
        <textarea
          data-testid="journal-quick-entry"
          class="w-full min-h-[100px] p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent resize-y text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          [ngModel]="content()"
          (ngModelChange)="onContentChange($event)"
          (blur)="save()"
          placeholder="Write in your journal...">
        </textarea>
      </mat-card-content>
      <mat-card-actions align="end">
        <button mat-button (click)="openJournal()">
          <mat-icon>open_in_full</mat-icon>
          Full Journal
        </button>
      </mat-card-actions>
    </mat-card>
  `,
})
export class JournalWidgetComponent {
  protected readonly journalStore = inject(JournalStore);
  private readonly router = inject(Router);
  protected readonly content = signal('');

  private saveTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private entryId: string | null = null;

  constructor() {
    this.initEntry();
  }

  private async initEntry(): Promise<void> {
    try {
      const entry = await this.journalStore.ensureTodayEntry();
      if (entry) {
        this.entryId = entry.id;
        this.content.set(entry.content);
      }
    } catch {
      // Journal entry creation failed — widget remains empty
    }
  }

  protected onContentChange(value: string): void {
    this.content.set(value);
    if (this.saveTimeoutId) clearTimeout(this.saveTimeoutId);
    this.saveTimeoutId = setTimeout(() => this.save(), 2000);
  }

  protected save(): void {
    if (this.saveTimeoutId) {
      clearTimeout(this.saveTimeoutId);
      this.saveTimeoutId = null;
    }
    if (this.entryId) {
      this.journalStore.updateEntry(this.entryId, this.content());
    }
  }

  protected openJournal(): void {
    this.router.navigate(['/journal']);
  }
}
