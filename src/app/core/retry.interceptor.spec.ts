import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { retryInterceptor, getBackoffDelay } from './retry.interceptor';

describe('retryInterceptor', () => {
  let httpClient: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    jasmine.clock().install();
    spyOn(Math, 'random').and.returnValue(0.5);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([retryInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
    httpTesting.verify();
  });

  it('should pass through non-Google API requests without retry', () => {
    let errorStatus = 0;
    httpClient.get('https://example.com/api').subscribe({
      error: (err) => { errorStatus = err.status; },
    });

    httpTesting.expectOne('https://example.com/api')
      .flush('Server Error', { status: 500, statusText: 'Server Error' });

    expect(errorStatus).toBe(500);
  });

  it('should pass through successful Google API requests', () => {
    let result: unknown;
    httpClient.get('https://tasks.googleapis.com/tasks/v1/lists').subscribe({
      next: (res) => { result = res; },
    });

    httpTesting.expectOne(r => r.url.includes('googleapis.com'))
      .flush({ items: [] });

    expect(result).toEqual({ items: [] });
  });

  it('should not retry non-429 errors on Google API', () => {
    let errorStatus = 0;
    httpClient.get('https://tasks.googleapis.com/tasks/v1/lists').subscribe({
      error: (err) => { errorStatus = err.status; },
    });

    httpTesting.expectOne(r => r.url.includes('googleapis.com'))
      .flush('Not Found', { status: 404, statusText: 'Not Found' });

    expect(errorStatus).toBe(404);
  });

  it('should retry on 429 after backoff delay', () => {
    let result: unknown;
    httpClient.get('https://tasks.googleapis.com/tasks/v1/lists').subscribe({
      next: (res) => { result = res; },
    });

    httpTesting.expectOne(r => r.url.includes('googleapis.com'))
      .flush('', { status: 429, statusText: 'Too Many Requests' });

    // Backoff: 2^0 * 1000 + 500 = 1500ms
    jasmine.clock().tick(1500);

    httpTesting.expectOne(r => r.url.includes('googleapis.com'))
      .flush({ items: ['ok'] });

    expect(result).toEqual({ items: ['ok'] });
  });

  it('should not retry before backoff delay elapses', () => {
    httpClient.get('https://tasks.googleapis.com/tasks/v1/lists').subscribe();

    httpTesting.expectOne(r => r.url.includes('googleapis.com'))
      .flush('', { status: 429, statusText: 'Too Many Requests' });

    // Tick less than the backoff (1500ms)
    jasmine.clock().tick(1000);
    httpTesting.expectNone(r => r.url.includes('googleapis.com'));

    // Now tick past the delay
    jasmine.clock().tick(500);

    httpTesting.expectOne(r => r.url.includes('googleapis.com'))
      .flush({ items: [] });
  });

  it('should retry multiple times on consecutive 429s', () => {
    let result: unknown;
    httpClient.get('https://tasks.googleapis.com/tasks/v1/lists').subscribe({
      next: (res) => { result = res; },
    });

    // Attempt 0 → 429
    httpTesting.expectOne(r => r.url.includes('googleapis.com'))
      .flush('', { status: 429, statusText: 'Too Many Requests' });
    jasmine.clock().tick(1500); // 2^0 * 1000 + 500

    // Attempt 1 → 429
    httpTesting.expectOne(r => r.url.includes('googleapis.com'))
      .flush('', { status: 429, statusText: 'Too Many Requests' });
    jasmine.clock().tick(2500); // 2^1 * 1000 + 500

    // Attempt 2 → success
    httpTesting.expectOne(r => r.url.includes('googleapis.com'))
      .flush({ items: ['finally'] });

    expect(result).toEqual({ items: ['finally'] });
  });

  it('should give up after max retries', () => {
    let errorStatus = 0;
    httpClient.get('https://tasks.googleapis.com/tasks/v1/lists').subscribe({
      error: (err) => { errorStatus = err.status; },
    });

    // 6 total attempts: initial (0) + 5 retries (1-5)
    for (let i = 0; i < 5; i++) {
      httpTesting.expectOne(r => r.url.includes('googleapis.com'))
        .flush('', { status: 429, statusText: 'Too Many Requests' });
      jasmine.clock().tick(Math.pow(2, i) * 1000 + 500);
    }

    // Final attempt (attempt 5) → 429 → no more retries
    httpTesting.expectOne(r => r.url.includes('googleapis.com'))
      .flush('', { status: 429, statusText: 'Too Many Requests' });

    expect(errorStatus).toBe(429);
  });

  describe('getBackoffDelay', () => {
    it('should calculate exponential base with jitter', () => {
      // Math.random spied to return 0.5 → 500ms jitter
      expect(getBackoffDelay(0)).toBe(1500);  // 2^0 * 1000 + 500
      expect(getBackoffDelay(1)).toBe(2500);  // 2^1 * 1000 + 500
      expect(getBackoffDelay(2)).toBe(4500);  // 2^2 * 1000 + 500
      expect(getBackoffDelay(3)).toBe(8500);  // 2^3 * 1000 + 500
      expect(getBackoffDelay(4)).toBe(16500); // 2^4 * 1000 + 500
    });
  });
});
