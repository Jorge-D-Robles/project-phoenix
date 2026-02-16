import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { signal } from '@angular/core';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/auth.service';

describe('LoginComponent', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  const isAuthenticated = signal(false);
  const isLoading = signal(false);

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['login'], {
      isAuthenticated: isAuthenticated.asReadonly(),
      isLoading: isLoading.asReadonly(),
    });
    mockAuthService.login.and.resolveTo();

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockRouter.navigate.and.resolveTo(true);

    // Reset signals before each test
    isAuthenticated.set(false);
    isLoading.set(false);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        provideAnimationsAsync(),
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render app branding', async () => {
    const fixture = TestBed.createComponent(LoginComponent);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Phoenix');
  });

  it('should render Google Sign-In button', async () => {
    const fixture = TestBed.createComponent(LoginComponent);
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('[data-testid="login-button"]');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Sign in with Google');
  });

  it('should call authService.login() on button click', async () => {
    const fixture = TestBed.createComponent(LoginComponent);
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector(
      '[data-testid="login-button"]',
    ) as HTMLButtonElement;
    button.click();

    expect(mockAuthService.login).toHaveBeenCalled();
  });

  it('should show spinner when loading', async () => {
    isLoading.set(true);
    const fixture = TestBed.createComponent(LoginComponent);
    await fixture.whenStable();

    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeTruthy();
  });

  it('should hide login button when loading', async () => {
    isLoading.set(true);
    const fixture = TestBed.createComponent(LoginComponent);
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('[data-testid="login-button"]');
    expect(button).toBeFalsy();
  });

  it('should redirect authenticated users to /dashboard', async () => {
    isAuthenticated.set(true);
    const fixture = TestBed.createComponent(LoginComponent);
    await fixture.whenStable();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
