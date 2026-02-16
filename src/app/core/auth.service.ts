import { inject, Injectable, signal } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { AUTH_CONFIG, GOOGLE_SCOPES } from './auth.config';
import { UserProfile } from '../data/models/user.model';

const MOCK_USER: UserProfile = {
  email: 'dev@phoenix.local',
  name: 'Dev User',
  picture: '',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly config = inject(AUTH_CONFIG);
  private readonly oauthService = inject(OAuthService);

  private readonly _user = signal<UserProfile | null>(null);
  private readonly _isAuthenticated = signal(false);
  private readonly _isLoading = signal(false);
  private _mockToken: string | null = null;

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  async init(): Promise<void> {
    if (this.config.useMock) {
      return;
    }

    this.oauthService.configure({
      issuer: 'https://accounts.google.com',
      clientId: this.config.googleClientId,
      redirectUri: window.location.origin,
      scope: GOOGLE_SCOPES.baseline,
      responseType: 'code',
      showDebugInformation: false,
      strictDiscoveryDocumentValidation: false,
    });

    await this.oauthService.loadDiscoveryDocumentAndTryLogin();

    if (this.oauthService.hasValidAccessToken()) {
      this.populateUserFromClaims();
    }
  }

  async login(): Promise<void> {
    this._isLoading.set(true);

    if (this.config.useMock) {
      this._user.set(MOCK_USER);
      this._isAuthenticated.set(true);
      this._mockToken = 'mock-access-token';
      this._isLoading.set(false);
      return;
    }

    this.oauthService.initCodeFlow();
    this._isLoading.set(false);
  }

  logout(): void {
    this._user.set(null);
    this._isAuthenticated.set(false);
    this._mockToken = null;

    if (!this.config.useMock) {
      this.oauthService.logOut();
    }
  }

  getAccessToken(): string | null {
    if (!this._isAuthenticated()) {
      return null;
    }

    if (this.config.useMock) {
      return this._mockToken;
    }

    return this.oauthService.getAccessToken() ?? null;
  }

  async refreshToken(): Promise<boolean> {
    if (!this._isAuthenticated()) {
      return false;
    }

    if (this.config.useMock) {
      return true;
    }

    try {
      await this.oauthService.silentRefresh();
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  private populateUserFromClaims(): void {
    const claims = this.oauthService.getIdentityClaims() as Record<string, string>;
    if (claims) {
      this._user.set({
        email: claims['email'] ?? '',
        name: claims['name'] ?? '',
        picture: claims['picture'] ?? '',
      });
      this._isAuthenticated.set(true);
    }
  }
}
