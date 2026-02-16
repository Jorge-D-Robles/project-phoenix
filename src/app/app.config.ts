import {
  APP_INITIALIZER,
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { OAuthService, provideOAuthClient } from 'angular-oauth2-oidc';

import { routes } from './app.routes';
import { AUTH_CONFIG, GOOGLE_SCOPES } from './core/auth.config';
import { AuthService } from './core/auth.service';
import { authInterceptor } from './core/auth.interceptor';
import { retryInterceptor } from './core/retry.interceptor';
import { environment } from '../environments/environment.development';

function initAuth(authService: AuthService): () => Promise<void> {
  return () => authService.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([retryInterceptor, authInterceptor])),
    provideOAuthClient(),
    { provide: AUTH_CONFIG, useValue: environment },
    {
      provide: APP_INITIALIZER,
      useFactory: initAuth,
      deps: [AuthService],
      multi: true,
    },
  ],
};
