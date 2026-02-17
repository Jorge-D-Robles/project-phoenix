import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="flex items-center justify-center min-h-screen bg-surface">
      <mat-card class="w-full max-w-sm p-8">
        <mat-card-header class="flex flex-col items-center mb-6">
          <mat-icon class="text-primary text-6xl mb-4" style="font-size: 64px; width: 64px; height: 64px;">
            local_fire_department
          </mat-icon>
          <mat-card-title class="text-2xl font-bold text-center">Phoenix</mat-card-title>
          <mat-card-subtitle class="text-center mt-2">
            Unified Productivity Ecosystem
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content class="flex flex-col items-center">
          @if (authService.isLoading()) {
            <mat-spinner diameter="40"></mat-spinner>
          } @else {
            <button
              mat-raised-button
              color="primary"
              data-testid="login-button"
              class="w-full"
              (click)="onLogin()"
            >
              <mat-icon>login</mat-icon>
              Sign in with Google
            </button>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  async onLogin(): Promise<void> {
    await this.authService.login();
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }
}
