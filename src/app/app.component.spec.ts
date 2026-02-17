import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { App } from './app.component';
import { AuthService } from './core/auth.service';
import { UserProfile } from './data/models/user.model';
import { KeyboardHelpDialogComponent } from './shared/keyboard-help-dialog.component';

describe('App', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockRouter: jasmine.SpyObj<Router>;
  const isAuthenticated = signal(false);
  const isLoading = signal(false);
  const user = signal<UserProfile | null>(null);

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'logout', 'init'], {
      isAuthenticated: isAuthenticated.asReadonly(),
      isLoading: isLoading.asReadonly(),
      user: user.asReadonly(),
    });

    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'serializeUrl'], {
      events: { subscribe: () => ({ unsubscribe: () => {} }) },
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
        { provide: MatDialog, useValue: mockDialog },
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

  describe('keyboard shortcuts', () => {
    beforeEach(() => {
      isAuthenticated.set(true);
      user.set({ email: 'test@example.com', name: 'Test User', picture: '' });
    });

    it('should open the help dialog when "?" is pressed', async () => {
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: '?', bubbles: true }));

      expect(mockDialog.open).toHaveBeenCalledWith(KeyboardHelpDialogComponent, jasmine.any(Object));
    });

    it('should NOT open help dialog when "?" is pressed and target is an input', async () => {
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      // Dispatch from the focused input so event.target is the input
      input.dispatchEvent(new KeyboardEvent('keydown', { key: '?', bubbles: true }));

      expect(mockDialog.open).not.toHaveBeenCalled();
      document.body.removeChild(input);
    });

    it('should NOT open help dialog when "?" is pressed and target is a textarea', async () => {
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      textarea.focus();

      textarea.dispatchEvent(new KeyboardEvent('keydown', { key: '?', bubbles: true }));

      expect(mockDialog.open).not.toHaveBeenCalled();
      document.body.removeChild(textarea);
    });

    it('should NOT fire shortcuts when not authenticated', async () => {
      isAuthenticated.set(false);
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: '?', bubbles: true }));

      expect(mockDialog.open).not.toHaveBeenCalled();
    });

    it('should navigate to /dashboard when "g" then "d" is pressed', async () => {
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', bubbles: true }));

      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should navigate to /tasks when "g" then "t" is pressed', async () => {
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 't', bubbles: true }));

      expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
    });

    it('should not navigate after the 1-second chord window expires', async () => {
      jasmine.clock().install();
      try {
        const fixture = TestBed.createComponent(App);
        await fixture.whenStable();

        const router = TestBed.inject(Router);
        spyOn(router, 'navigate');

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }));

        // Advance past the 1-second timeout
        jasmine.clock().tick(1001);

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', bubbles: true }));

        expect(router.navigate).not.toHaveBeenCalled();
      } finally {
        jasmine.clock().uninstall();
      }
    });
  });
});
