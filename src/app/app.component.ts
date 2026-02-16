import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ThemeService } from './core/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <mat-sidenav-container class="h-screen">
      <mat-sidenav #sidenav mode="side" [opened]="true"
                   class="w-60 border-r border-gray-200 dark:border-gray-700">
        <div class="p-4">
          <h2 class="text-lg font-semibold text-primary">Phoenix</h2>
        </div>
        <mat-nav-list>
          @for (link of navLinks; track link.path) {
            <a mat-list-item [routerLink]="link.path" routerLinkActive="!bg-primary/10">
              <mat-icon matListItemIcon>{{ link.icon }}</mat-icon>
              <span matListItemTitle>{{ link.label }}</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="flex items-center gap-2">
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="text-lg font-medium">Project Phoenix</span>
          <span class="flex-1"></span>
          <button mat-icon-button (click)="themeService.toggle()"
                  [attr.aria-label]="themeService.isDark() ? 'Switch to light mode' : 'Switch to dark mode'">
            <mat-icon>{{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
          </button>
        </mat-toolbar>

        <main>
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    mat-sidenav-container {
      height: 100vh;
    }
  `,
})
export class App {
  protected readonly themeService = inject(ThemeService);

  protected readonly navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/tasks', label: 'Tasks', icon: 'task_alt' },
    { path: '/calendar', label: 'Calendar', icon: 'calendar_month' },
    { path: '/habits', label: 'Habits', icon: 'local_fire_department' },
    { path: '/notes', label: 'Notes', icon: 'note' },
  ];

  constructor() {
    this.themeService.init();
  }
}
