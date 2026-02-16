import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { signal } from '@angular/core';
import { App } from './app.component';
import { AuthService } from './core/auth.service';
import { UserProfile } from './data/models/user.model';

describe('App', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  const isAuthenticated = signal(false);
  const isLoading = signal(false);
  const user = signal<UserProfile | null>(null);

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'logout', 'init'], {
      isAuthenticated: isAuthenticated.asReadonly(),
      isLoading: isLoading.asReadonly(),
      user: user.asReadonly(),
    });

    // Reset signals
    isAuthenticated.set(false);
    isLoading.set(false);
    user.set(null);

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('when not authenticated', () => {
    it('should not render the sidenav shell', async () => {
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const sidenav = fixture.nativeElement.querySelector('mat-sidenav-container');
      expect(sidenav).toBeFalsy();
    });

    it('should render a bare router-outlet', async () => {
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const outlet = fixture.nativeElement.querySelector('router-outlet');
      expect(outlet).toBeTruthy();
    });
  });

  describe('when authenticated', () => {
    beforeEach(() => {
      isAuthenticated.set(true);
      user.set({ email: 'test@example.com', name: 'Test User', picture: '' });
    });

    it('should render the toolbar with app title', async () => {
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      expect(fixture.nativeElement.textContent).toContain('Project Phoenix');
    });

    it('should render the sidenav with navigation links', async () => {
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Dashboard');
      expect(el.textContent).toContain('Tasks');
      expect(el.textContent).toContain('Calendar');
      expect(el.textContent).toContain('Habits');
      expect(el.textContent).toContain('Notes');
    });

    it('should display user name in toolbar', async () => {
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const userName = fixture.nativeElement.querySelector('[data-testid="user-name"]');
      expect(userName?.textContent).toContain('Test User');
    });

    it('should have a logout button', async () => {
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const logoutBtn = fixture.nativeElement.querySelector('[data-testid="logout-button"]');
      expect(logoutBtn).toBeTruthy();
    });

    it('should call logout on logout button click', async () => {
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const logoutBtn = fixture.nativeElement.querySelector(
        '[data-testid="logout-button"]',
      ) as HTMLButtonElement;
      logoutBtn.click();

      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });
});
