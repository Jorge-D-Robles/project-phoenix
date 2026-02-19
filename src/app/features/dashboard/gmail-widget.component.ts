import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GmailStore } from '../../state/gmail.store';

@Component({
  selector: 'app-gmail-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatIconModule, MatBadgeModule, MatButtonModule, MatTooltipModule],
  template: `
    <mat-card data-testid="gmail-card" class="h-full">
      <mat-card-header>
        <mat-card-title class="flex items-center gap-2 text-base">
          <mat-icon
            [matBadge]="gmailStore.unreadCount()"
            [matBadgeHidden]="!gmailStore.hasUnread()"
            matBadgeColor="warn"
            matBadgeSize="small">
            mail
          </mat-icon>
          Inbox
          <span class="flex-1"></span>
          <button mat-icon-button
                  (click)="gmailStore.refresh()"
                  matTooltip="Refresh"
                  aria-label="Refresh inbox">
            <mat-icon>refresh</mat-icon>
          </button>
        </mat-card-title>
      </mat-card-header>
      <mat-card-content class="mt-3">
        @if (gmailStore.recentMessages().length === 0) {
          <p data-testid="empty-state" class="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
            No unread messages
          </p>
        } @else {
          <div class="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
            @for (msg of gmailStore.recentMessages(); track msg.id) {
              <div data-testid="gmail-item" class="py-2 flex flex-col gap-0.5 min-w-0">
                <span data-testid="gmail-from" class="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">
                  {{ msg.from }}
                </span>
                <span data-testid="gmail-subject" class="text-sm font-medium truncate">
                  {{ msg.subject }}
                </span>
                <span data-testid="gmail-snippet" class="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {{ msg.snippet }}
                </span>
              </div>
            }
          </div>
        }
      </mat-card-content>
      <mat-card-actions align="end">
        <a mat-button
           href="https://mail.google.com"
           target="_blank"
           rel="noopener noreferrer">
          <mat-icon>open_in_new</mat-icon>
          Open Gmail
        </a>
      </mat-card-actions>
    </mat-card>
  `,
})
export class GmailWidgetComponent {
  protected readonly gmailStore = inject(GmailStore);
}
