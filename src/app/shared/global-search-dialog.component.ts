import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { TasksStore } from '../state/tasks.store';
import { NotesStore } from '../state/notes.store';
import { HabitsStore } from '../state/habits.store';
import { CalendarStore } from '../state/calendar.store';

interface SearchResult {
  readonly type: 'task' | 'note' | 'habit' | 'event';
  readonly icon: string;
  readonly title: string;
  readonly subtitle: string;
  readonly route: string;
  readonly id: string;
}

@Component({
  selector: 'app-global-search-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
  ],
  template: `
    <div class="w-[520px] max-h-[480px]">
      <div class="p-4 pb-2">
        <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
          <mat-icon matPrefix class="mr-1">search</mat-icon>
          <input matInput
                 data-testid="global-search-input"
                 placeholder="Search tasks, notes, habits, events..."
                 [(ngModel)]="query"
                 (ngModelChange)="onQueryChange($event)"
                 cdkFocusInitial />
        </mat-form-field>
      </div>

      @if (query.length > 0) {
        <div class="max-h-[360px] overflow-y-auto px-2 pb-2">
          @if (results().length === 0) {
            <p class="text-sm text-gray-500 text-center py-6" data-testid="no-results">
              No results found
            </p>
          } @else {
            <mat-nav-list dense>
              @for (group of groupedResults(); track group.type) {
                <div class="px-2 pt-2 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {{ group.type }}s
                </div>
                @for (result of group.items; track result.id) {
                  <a mat-list-item
                     data-testid="search-result"
                     (click)="onSelect(result)">
                    <mat-icon matListItemIcon>{{ result.icon }}</mat-icon>
                    <span matListItemTitle>{{ result.title }}</span>
                    <span matListItemLine class="!text-xs !text-gray-500">{{ result.subtitle }}</span>
                  </a>
                }
              }
            </mat-nav-list>
          }
        </div>
      } @else {
        <p class="text-sm text-gray-400 text-center py-6">
          Type to search across all features
        </p>
      }
    </div>
  `,
})
export class GlobalSearchDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<GlobalSearchDialogComponent>);
  private readonly router = inject(Router);
  private readonly tasksStore = inject(TasksStore);
  private readonly notesStore = inject(NotesStore);
  private readonly habitsStore = inject(HabitsStore);
  private readonly calendarStore = inject(CalendarStore);

  protected query = '';
  private readonly searchSignal = signal('');

  protected readonly results = computed<SearchResult[]>(() => {
    const q = this.searchSignal().toLowerCase().trim();
    if (!q) return [];

    const results: SearchResult[] = [];

    // Tasks
    for (const task of this.tasksStore.tasks()) {
      if (task.title.toLowerCase().includes(q)) {
        results.push({
          type: 'task',
          icon: 'task_alt',
          title: task.title,
          subtitle: task.status === 'completed' ? 'Completed' : 'Active',
          route: '/tasks',
          id: task.id,
        });
      }
    }

    // Notes
    for (const note of this.notesStore.notes()) {
      if (note.title.toLowerCase().includes(q) || note.content.toLowerCase().includes(q)) {
        results.push({
          type: 'note',
          icon: 'note',
          title: note.title || 'Untitled',
          subtitle: note.labels.join(', ') || 'No labels',
          route: '/notes',
          id: note.id,
        });
      }
    }

    // Habits
    for (const habit of this.habitsStore.activeHabits()) {
      if (habit.title.toLowerCase().includes(q)) {
        results.push({
          type: 'habit',
          icon: 'local_fire_department',
          title: habit.title,
          subtitle: `${habit.frequency} habit`,
          route: '/habits',
          id: habit.id,
        });
      }
    }

    // Events
    for (const event of this.calendarStore.events()) {
      if (event.summary.toLowerCase().includes(q)) {
        results.push({
          type: 'event',
          icon: 'event',
          title: event.summary,
          subtitle: event.allDay ? 'All day' : event.start.substring(0, 10),
          route: '/calendar',
          id: event.id,
        });
      }
    }

    return results.slice(0, 20);
  });

  protected readonly groupedResults = computed(() => {
    const all = this.results();
    const groups: { type: string; items: SearchResult[] }[] = [];
    const types = ['task', 'note', 'habit', 'event'] as const;
    for (const type of types) {
      const items = all.filter(r => r.type === type);
      if (items.length > 0) {
        groups.push({ type, items });
      }
    }
    return groups;
  });

  protected onQueryChange(value: string): void {
    this.searchSignal.set(value);
  }

  protected onSelect(result: SearchResult): void {
    this.dialogRef.close();
    this.router.navigate([result.route]);
  }
}
