import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-review-plan-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatIconModule],
  template: `
    <div data-testid="review-plan-step" class="flex flex-col gap-4">
      <h3 class="text-lg font-semibold">Plan Next Week</h3>
      <p class="text-sm text-gray-500">What are your top priorities for next week?</p>
      <textarea
        data-testid="plan-textarea"
        class="w-full min-h-[200px] p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent resize-y text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        [ngModel]="goals()"
        (ngModelChange)="goals.set($event)"
        placeholder="1. Top priority for next week...&#10;2. Secondary goal...&#10;3. Nice to have...">
      </textarea>
    </div>
  `,
})
export class ReviewPlanStepComponent {
  readonly goals = signal('');
}
