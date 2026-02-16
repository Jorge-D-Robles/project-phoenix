import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpTesting: HttpTestingController;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'getAccessToken',
      'refreshToken',
      'logout',
    ]);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should attach Bearer token to Google API requests', () => {
    mockAuthService.getAccessToken.and.returnValue('test-token-123');

    httpClient.get('https://tasks.googleapis.com/tasks/v1/lists').subscribe();

    const req = httpTesting.expectOne('https://tasks.googleapis.com/tasks/v1/lists');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token-123');
    req.flush({});
  });

  it('should skip token for non-Google URLs', () => {
    mockAuthService.getAccessToken.and.returnValue('test-token-123');

    httpClient.get('https://example.com/api/data').subscribe();

    const req = httpTesting.expectOne('https://example.com/api/data');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should skip token when not authenticated', () => {
    mockAuthService.getAccessToken.and.returnValue(null);

    httpClient.get('https://tasks.googleapis.com/tasks/v1/lists').subscribe();

    const req = httpTesting.expectOne('https://tasks.googleapis.com/tasks/v1/lists');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should retry on 401 after successful token refresh', async () => {
    mockAuthService.getAccessToken.and.returnValues('expired-token', 'new-token');
    mockAuthService.refreshToken.and.resolveTo(true);

    httpClient.get('https://tasks.googleapis.com/tasks/v1/lists').subscribe();

    const req = httpTesting.expectOne('https://tasks.googleapis.com/tasks/v1/lists');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // Wait for the async refreshToken promise to resolve
    await TestBed.inject(AuthService).refreshToken();

    // After refresh, should retry with new token
    const retryReq = httpTesting.expectOne('https://tasks.googleapis.com/tasks/v1/lists');
    expect(retryReq.request.headers.get('Authorization')).toBe('Bearer new-token');
    retryReq.flush({ data: 'success' });
  });

  it('should logout on 401 when refresh fails', async () => {
    mockAuthService.getAccessToken.and.returnValue('expired-token');
    mockAuthService.refreshToken.and.resolveTo(false);

    httpClient.get('https://tasks.googleapis.com/tasks/v1/lists').subscribe({
      error: () => {
        // Expected error
      },
    });

    const req = httpTesting.expectOne('https://tasks.googleapis.com/tasks/v1/lists');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // Wait for the async refreshToken promise to resolve
    await TestBed.inject(AuthService).refreshToken();

    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('should pass through non-401 errors for Google URLs', () => {
    mockAuthService.getAccessToken.and.returnValue('valid-token');

    let errorStatus = 0;
    httpClient.get('https://tasks.googleapis.com/tasks/v1/lists').subscribe({
      error: (err) => {
        errorStatus = err.status;
      },
    });

    const req = httpTesting.expectOne('https://tasks.googleapis.com/tasks/v1/lists');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });

    expect(errorStatus).toBe(404);
  });
});
