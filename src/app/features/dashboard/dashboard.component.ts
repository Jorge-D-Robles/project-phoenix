import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold">Dashboard</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Dashboard overview coming soon.</p>
    </div>
  `,
})
export class DashboardComponent {}
