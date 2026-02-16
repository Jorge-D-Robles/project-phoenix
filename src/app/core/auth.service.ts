import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { OAuthService } from 'angular-oauth2-oidc';
import { AUTH_CONFIG, GOOGLE_SCOPES } from './auth.config';
import { UserProfile } from '../data/models/user.model';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mockToken: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  mockToken: null,
};

const MOCK_USER: UserProfile = {
  email: 'dev@phoenix.local',
  name: 'Dev User',
  picture: '',
};

export const AuthService = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, oauthService = inject(OAuthService), config = inject(AUTH_CONFIG)) => ({
    async init(): Promise<void> {
      if (config.useMock) {
        return;
      }

      oauthService.configure({
        issuer: 'https://accounts.google.com',
        clientId: config.googleClientId,
        redirectUri: window.location.origin,
        scope: GOOGLE_SCOPES.baseline,
        responseType: 'code',
        showDebugInformation: false,
        strictDiscoveryDocumentValidation: false,
      });

      await oauthService.loadDiscoveryDocumentAndTryLogin();

      if (oauthService.hasValidAccessToken()) {
        const claims = oauthService.getIdentityClaims() as Record<string, string>;
        if (claims) {
          patchState(store, {
            user: {
              email: claims['email'] ?? '',
              name: claims['name'] ?? '',
              picture: claims['picture'] ?? '',
            },
            isAuthenticated: true,
          });
        }
      }
    },

    async login(): Promise<void> {
      patchState(store, { isLoading: true });

      if (config.useMock) {
        patchState(store, {
          user: MOCK_USER,
          isAuthenticated: true,
          mockToken: 'mock-access-token',
          isLoading: false,
        });
        return;
      }

      oauthService.initCodeFlow();
      patchState(store, { isLoading: false });
    },

    logout(): void {
      patchState(store, {
        user: null,
        isAuthenticated: false,
        mockToken: null,
      });

      if (!config.useMock) {
        oauthService.logOut();
      }
    },

    getAccessToken(): string | null {
      if (!store.isAuthenticated()) {
        return null;
      }

      if (config.useMock) {
        return store.mockToken();
      }

      return oauthService.getAccessToken() ?? null;
    },

    async refreshToken(): Promise<boolean> {
      if (!store.isAuthenticated()) {
        return false;
      }

      if (config.useMock) {
        return true;
      }

      try {
        await oauthService.silentRefresh();
        return true;
      } catch {
        patchState(store, {
          user: null,
          isAuthenticated: false,
          mockToken: null,
        });
        oauthService.logOut();
        return false;
      }
    },
  })),
);

export type AuthService = InstanceType<typeof AuthService>;
