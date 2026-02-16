import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated: jasmine.createSpy().and.returnValue(false),
    });

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: Router,
          useValue: { createUrlTree: jasmine.createSpy().and.returnValue({} as UrlTree) },
        },
      ],
    });

    router = TestBed.inject(Router);
  });

  it('should allow navigation when authenticated', () => {
    (mockAuthService.isAuthenticated as jasmine.Spy).and.returnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, {} as never),
    );

    expect(result).toBe(true);
  });

  it('should redirect to /login when not authenticated', () => {
    (mockAuthService.isAuthenticated as jasmine.Spy).and.returnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, {} as never),
    );

    expect(result).not.toBe(true);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
