import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { AUTH_CONFIG, AuthConfig } from './auth.config';
import { OAuthService } from 'angular-oauth2-oidc';

describe('AuthService', () => {
  describe('mock mode', () => {
    let service: AuthService;
    const mockConfig: AuthConfig = { useMock: true, googleClientId: 'test-client', googleClientSecret: '' };

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: AUTH_CONFIG, useValue: mockConfig },
          { provide: OAuthService, useValue: jasmine.createSpyObj('OAuthService', ['configure']) },
        ],
      });
      service = TestBed.inject(AuthService);
    });

    it('should have initial unauthenticated state', () => {
      expect(service.isAuthenticated()).toBe(false);
      expect(service.user()).toBeNull();
      expect(service.isLoading()).toBe(false);
    });

    it('should login with mock user', async () => {
      await service.login();

      expect(service.isAuthenticated()).toBe(true);
      expect(service.isLoading()).toBe(false);
      expect(service.user()).toEqual({
        email: 'dev@phoenix.local',
        name: 'Dev User',
        picture: '',
      });
    });

    it('should return mock token when authenticated', async () => {
      expect(service.getAccessToken()).toBeNull();

      await service.login();
      expect(service.getAccessToken()).toBe('mock-access-token');
    });

    it('should logout and clear state', async () => {
      await service.login();
      expect(service.isAuthenticated()).toBe(true);

      service.logout();
      expect(service.isAuthenticated()).toBe(false);
      expect(service.user()).toBeNull();
      expect(service.getAccessToken()).toBeNull();
    });

    it('should refresh token in mock mode', async () => {
      await service.login();
      const result = await service.refreshToken();
      expect(result).toBe(true);
    });

    it('should fail refresh when not authenticated', async () => {
      const result = await service.refreshToken();
      expect(result).toBe(false);
    });

    it('should init without error in mock mode', async () => {
      await expectAsync(service.init()).toBeResolved();
    });
  });

  describe('real mode', () => {
    let service: AuthService;
    let mockOAuth: jasmine.SpyObj<OAuthService>;
    const realConfig: AuthConfig = { useMock: false, googleClientId: 'real-client-id', googleClientSecret: 'test-secret' };

    beforeEach(() => {
      mockOAuth = jasmine.createSpyObj('OAuthService', [
        'configure',
        'loadDiscoveryDocumentAndTryLogin',
        'initCodeFlow',
        'logOut',
        'getAccessToken',
        'hasValidAccessToken',
        'silentRefresh',
        'getIdentityClaims',
      ]);

      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: AUTH_CONFIG, useValue: realConfig },
          { provide: OAuthService, useValue: mockOAuth },
        ],
      });
      service = TestBed.inject(AuthService);
    });

    it('should have initial unauthenticated state', () => {
      expect(service.isAuthenticated()).toBe(false);
      expect(service.user()).toBeNull();
      expect(service.isLoading()).toBe(false);
    });

    it('should configure OAuthService and try login on init', async () => {
      mockOAuth.loadDiscoveryDocumentAndTryLogin.and.resolveTo(true);
      mockOAuth.hasValidAccessToken.and.returnValue(false);

      await service.init();

      expect(mockOAuth.configure).toHaveBeenCalled();
      expect(mockOAuth.loadDiscoveryDocumentAndTryLogin).toHaveBeenCalled();
    });

    it('should populate user on init when already authenticated', async () => {
      mockOAuth.loadDiscoveryDocumentAndTryLogin.and.resolveTo(true);
      mockOAuth.hasValidAccessToken.and.returnValue(true);
      mockOAuth.getIdentityClaims.and.returnValue({
        email: 'test@gmail.com',
        name: 'Test User',
        picture: 'https://example.com/photo.jpg',
      });

      await service.init();

      expect(service.isAuthenticated()).toBe(true);
      expect(service.user()).toEqual({
        email: 'test@gmail.com',
        name: 'Test User',
        picture: 'https://example.com/photo.jpg',
      });
    });

    it('should initiate code flow on login', async () => {
      await service.login();
      expect(mockOAuth.initCodeFlow).toHaveBeenCalled();
    });

    it('should logout via OAuthService', () => {
      service.logout();

      expect(mockOAuth.logOut).toHaveBeenCalled();
      expect(service.isAuthenticated()).toBe(false);
      expect(service.user()).toBeNull();
    });

    it('should return access token from OAuthService', async () => {
      mockOAuth.loadDiscoveryDocumentAndTryLogin.and.resolveTo(true);
      mockOAuth.hasValidAccessToken.and.returnValue(true);
      mockOAuth.getIdentityClaims.and.returnValue({ email: 'test@gmail.com' });
      mockOAuth.getAccessToken.and.returnValue('real-token-123');

      await service.init();
      expect(service.getAccessToken()).toBe('real-token-123');
    });

    it('should return null when not authenticated', () => {
      expect(service.getAccessToken()).toBeNull();
    });

    it('should refresh token via silent refresh', async () => {
      mockOAuth.loadDiscoveryDocumentAndTryLogin.and.resolveTo(true);
      mockOAuth.hasValidAccessToken.and.returnValue(true);
      mockOAuth.getIdentityClaims.and.returnValue({ email: 'test@gmail.com' });
      await service.init();

      mockOAuth.silentRefresh.and.resolveTo({} as never);

      const result = await service.refreshToken();
      expect(result).toBe(true);
      expect(mockOAuth.silentRefresh).toHaveBeenCalled();
    });

    it('should logout on refresh failure', async () => {
      mockOAuth.loadDiscoveryDocumentAndTryLogin.and.resolveTo(true);
      mockOAuth.hasValidAccessToken.and.returnValue(true);
      mockOAuth.getIdentityClaims.and.returnValue({ email: 'test@gmail.com' });
      await service.init();

      mockOAuth.silentRefresh.and.rejectWith(new Error('refresh failed'));

      const result = await service.refreshToken();
      expect(result).toBe(false);
      expect(service.isAuthenticated()).toBe(false);
    });
  });
});
