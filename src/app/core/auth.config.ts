import { InjectionToken } from '@angular/core';

export interface AuthConfig {
  readonly useMock: boolean;
  readonly googleClientId: string;
  readonly googleClientSecret: string;
}

export const AUTH_CONFIG = new InjectionToken<AuthConfig>('AUTH_CONFIG');

export const GOOGLE_SCOPES = {
  baseline: 'openid email profile',
  tasks: 'https://www.googleapis.com/auth/tasks',
  calendar: 'https://www.googleapis.com/auth/calendar.events',
  drive: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata',
} as const;
