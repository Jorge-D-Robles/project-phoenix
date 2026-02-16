import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import type { CompletionSummary } from '../../state/dashboard.store';

@Component({
  selector: 'app-greeting-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatProgressBarModule, MatIconModule],
  template: `
    <div data-testid="greeting-header" class="flex flex-col gap-3">
      <div class="flex flex-col gap-1">
        <h1 data-testid="greeting-text" class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {{ greeting() }}
        </h1>
        <p data-testid="date-text" class="text-sm text-gray-500 dark:text-gray-400">
          {{ date() }}
        </p>
      </div>

      <div data-testid="summary-section" class="flex items-center gap-3">
        <div class="flex-1">
          <mat-progress-bar
            data-testid="progress-bar"
            mode="determinate"
            [value]="summary().percentage"
          />
        </div>
        <span data-testid="summary-text" class="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
          {{ summary().done }} of {{ summary().total }} tasks
        </span>
      </div>
    </div>
  `,
})
export class GreetingHeaderComponent {
  readonly greeting = input.required<string>();
  readonly date = input.required<string>();
  readonly summary = input.required<CompletionSummary>();
}
