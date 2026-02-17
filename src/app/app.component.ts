import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ThemeService } from './core/theme.service';
import { AuthService } from './core/auth.service';
import { FocusTimerComponent } from './features/focus/focus-timer.component';
import { GlobalSearchDialogComponent } from './shared/global-search-dialog.component';

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
    MatTooltipModule,
    FocusTimerComponent,
  ],
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
  template: `
    @if (authService.isAuthenticated()) {
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

            <button mat-icon-button
                    data-testid="global-search-btn"
                    (click)="openSearch()"
                    matTooltip="Search (Cmd+K)"
                    aria-label="Search">
              <mat-icon>search</mat-icon>
            </button>

            <app-focus-timer data-testid="focus-timer" />

            @if (authService.user(); as user) {
              <span class="text-sm mr-2" data-testid="user-name">{{ user.name }}</span>
            }

            <button mat-icon-button (click)="themeService.toggle()"
                    [attr.aria-label]="themeService.isDark() ? 'Switch to light mode' : 'Switch to dark mode'">
              <mat-icon>{{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
            </button>

            <button mat-icon-button (click)="authService.logout()"
                    aria-label="Logout" data-testid="logout-button">
              <mat-icon>logout</mat-icon>
            </button>
          </mat-toolbar>

          <main>
            <router-outlet />
          </main>
        </mat-sidenav-content>
      </mat-sidenav-container>
    } @else {
      <router-outlet />
    }
  `,
  styles: `
    mat-sidenav-container {
      height: 100vh;
    }
  `,
})
export class App {
  protected readonly themeService = inject(ThemeService);
  protected readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  protected readonly navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/tasks', label: 'Tasks', icon: 'task_alt' },
    { path: '/calendar', label: 'Calendar', icon: 'calendar_month' },
    { path: '/habits', label: 'Habits', icon: 'local_fire_department' },
    { path: '/notes', label: 'Notes', icon: 'note' },
    { path: '/insights', label: 'Insights', icon: 'insights' },
  ];

  constructor() {
    this.themeService.init();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.openSearch();
    }
  }

  protected openSearch(): void {
    if (!this.authService.isAuthenticated()) return;
    this.dialog.open(GlobalSearchDialogComponent, {
      width: '560px',
      panelClass: 'global-search-panel',
    });
  }
}
