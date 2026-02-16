import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-habits',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold">Habits</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Habits overview coming soon.</p>
    </div>
  `,
})
export class HabitsComponent {}
