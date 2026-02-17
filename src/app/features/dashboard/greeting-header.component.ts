import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import type { CompletionSummary } from '../../state/dashboard.store';

const RING_RADIUS = 40;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

@Component({
  selector: 'app-greeting-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div data-testid="greeting-header" class="flex flex-row items-center justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 data-testid="greeting-text" class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {{ greeting() }}
        </h1>
        <p data-testid="date-text" class="text-sm text-gray-500 dark:text-gray-400">
          {{ date() }}
        </p>
      </div>

      <div data-testid="summary-section" class="flex flex-col items-center gap-1">
        <svg
          data-testid="progress-ring"
          viewBox="0 0 100 100"
          width="88"
          height="88"
          class="block"
          aria-hidden="true"
        >
          <!-- Background track -->
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#e5e7eb"
            stroke-width="6"
            class="dark:stroke-gray-700"
          />
          <!-- Progress arc -->
          <circle
            data-testid="progress-arc"
            cx="50"
            cy="50"
            r="40"
            fill="none"
            [attr.stroke]="strokeColor()"
            stroke-width="6"
            stroke-linecap="round"
            [attr.stroke-dasharray]="circumference"
            [attr.stroke-dashoffset]="strokeDashoffset()"
            transform="rotate(-90 50 50)"
            style="transition: stroke-dashoffset 600ms ease-out, stroke 600ms ease-out;"
          />
          <!-- Percentage label -->
          <text
            x="50"
            y="50"
            text-anchor="middle"
            dominant-baseline="central"
            font-size="18"
            font-weight="bold"
            fill="currentColor"
            class="text-gray-900 dark:text-gray-100"
          >{{ summary().percentage }}%</text>
        </svg>
        <span data-testid="summary-text" class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
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

  readonly circumference = RING_CIRCUMFERENCE;

  readonly strokeColor = computed(() => {
    const pct = this.summary().percentage;
    if (pct >= 70) return '#22c55e';
    if (pct >= 40) return '#eab308';
    return '#ef4444';
  });

  readonly strokeDashoffset = computed(() => {
    const pct = Math.min(Math.max(this.summary().percentage, 0), 100);
    return RING_CIRCUMFERENCE * (1 - pct / 100);
  });
}
