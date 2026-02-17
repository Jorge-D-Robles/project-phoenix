import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface ShortcutGroup {
  readonly category: string;
  readonly shortcuts: ReadonlyArray<{ keys: string[]; description: string }>;
}

@Component({
  selector: 'app-keyboard-help-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="w-[480px] max-h-[80vh] flex flex-col">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold" mat-dialog-title>Keyboard Shortcuts</h2>
        <button mat-icon-button
                data-testid="close-button"
                aria-label="Close"
                (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="overflow-y-auto px-6 py-4" mat-dialog-content>
        @for (group of shortcutGroups; track group.category) {
          <section class="mb-6" [attr.data-testid]="'group-' + group.category.toLowerCase()">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
              {{ group.category }}
            </h3>
            <table class="w-full" [attr.data-testid]="group.category.toLowerCase() + '-shortcuts'">
              <tbody>
                @for (shortcut of group.shortcuts; track shortcut.description) {
                  <tr class="border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <td class="py-2 pr-6 w-1/3">
                      <span class="flex gap-1 items-center flex-wrap">
                        @for (key of shortcut.keys; track $index) {
                          <kbd class="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-sm font-mono border border-gray-300 dark:border-gray-600">
                            {{ key }}
                          </kbd>
                          @if ($index < shortcut.keys.length - 1) {
                            <span class="text-gray-400 text-xs">then</span>
                          }
                        }
                      </span>
                    </td>
                    <td class="py-2 text-sm text-gray-700 dark:text-gray-300">
                      {{ shortcut.description }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </section>
        }
      </div>
    </div>
  `,
})
export class KeyboardHelpDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<KeyboardHelpDialogComponent>);

  protected readonly shortcutGroups: ShortcutGroup[] = [
    {
      category: 'Navigation',
      shortcuts: [
        { keys: ['g', 'd'], description: 'Go to Dashboard' },
        { keys: ['g', 't'], description: 'Go to Tasks' },
        { keys: ['g', 'c'], description: 'Go to Calendar' },
        { keys: ['g', 'h'], description: 'Go to Habits' },
        { keys: ['g', 'n'], description: 'Go to Notes' },
        { keys: ['g', 'i'], description: 'Go to Insights' },
      ],
    },
    {
      category: 'Actions',
      shortcuts: [
        { keys: ['?'], description: 'Show keyboard shortcuts' },
        { keys: ['Cmd/Ctrl', 'K'], description: 'Open search' },
      ],
    },
  ];

  protected close(): void {
    this.dialogRef.close();
  }
}
