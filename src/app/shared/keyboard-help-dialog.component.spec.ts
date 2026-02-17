import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatDialogRef } from '@angular/material/dialog';
import { KeyboardHelpDialogComponent } from './keyboard-help-dialog.component';

describe('KeyboardHelpDialogComponent', () => {
  let fixture: ComponentFixture<KeyboardHelpDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<KeyboardHelpDialogComponent>>;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [KeyboardHelpDialogComponent],
      providers: [
        provideAnimationsAsync(),
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(KeyboardHelpDialogComponent);
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the dialog title "Keyboard Shortcuts"', () => {
    const title = fixture.nativeElement.querySelector('[mat-dialog-title]');
    expect(title?.textContent).toContain('Keyboard Shortcuts');
  });

  it('should render the Navigation shortcuts category', () => {
    const navGroup = fixture.nativeElement.querySelector('[data-testid="group-navigation"]');
    expect(navGroup).toBeTruthy();
    expect(navGroup.textContent).toContain('Navigation');
  });

  it('should render the Actions shortcuts category', () => {
    const actionsGroup = fixture.nativeElement.querySelector('[data-testid="group-actions"]');
    expect(actionsGroup).toBeTruthy();
    expect(actionsGroup.textContent).toContain('Actions');
  });

  describe('Navigation shortcuts', () => {
    let navTable: HTMLElement;

    beforeEach(() => {
      navTable = fixture.nativeElement.querySelector('[data-testid="navigation-shortcuts"]');
    });

    it('should display the Dashboard shortcut (g → d)', () => {
      expect(navTable.textContent).toContain('d');
      expect(navTable.textContent).toContain('Dashboard');
    });

    it('should display the Tasks shortcut (g → t)', () => {
      expect(navTable.textContent).toContain('t');
      expect(navTable.textContent).toContain('Tasks');
    });

    it('should display the Calendar shortcut (g → c)', () => {
      expect(navTable.textContent).toContain('c');
      expect(navTable.textContent).toContain('Calendar');
    });

    it('should display the Habits shortcut (g → h)', () => {
      expect(navTable.textContent).toContain('h');
      expect(navTable.textContent).toContain('Habits');
    });

    it('should display the Notes shortcut (g → n)', () => {
      expect(navTable.textContent).toContain('n');
      expect(navTable.textContent).toContain('Notes');
    });

    it('should display the Insights shortcut (g → i)', () => {
      expect(navTable.textContent).toContain('i');
      expect(navTable.textContent).toContain('Insights');
    });
  });

  describe('Actions shortcuts', () => {
    let actionsTable: HTMLElement;

    beforeEach(() => {
      actionsTable = fixture.nativeElement.querySelector('[data-testid="actions-shortcuts"]');
    });

    it('should display the help shortcut (?)', () => {
      expect(actionsTable.textContent).toContain('?');
    });

    it('should display the search shortcut (Cmd/Ctrl+K)', () => {
      expect(actionsTable.textContent).toContain('K');
      expect(actionsTable.textContent).toContain('search');
    });
  });

  it('should render kbd elements for shortcut keys', () => {
    const kbdElements = fixture.nativeElement.querySelectorAll('kbd');
    expect(kbdElements.length).toBeGreaterThan(0);
  });

  it('should close the dialog when close button is clicked', async () => {
    const closeBtn = fixture.nativeElement.querySelector('[data-testid="close-button"]') as HTMLButtonElement;
    closeBtn.click();
    await fixture.whenStable();

    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
