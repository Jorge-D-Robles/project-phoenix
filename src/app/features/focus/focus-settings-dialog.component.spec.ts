import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { FocusSettingsDialogComponent } from './focus-settings-dialog.component';
import { DEFAULT_FOCUS_SETTINGS } from '../../data/models/focus-session.model';
import type { FocusSettings } from '../../data/models/focus-session.model';

const CUSTOM_SETTINGS: FocusSettings = {
  workDuration: 30,
  shortBreakDuration: 10,
  longBreakDuration: 20,
  sessionsBeforeLongBreak: 3,
  autoStartBreaks: true,
  autoStartWork: true,
};

async function setup(data: FocusSettings = DEFAULT_FOCUS_SETTINGS) {
  const dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

  await TestBed.configureTestingModule({
    imports: [FocusSettingsDialogComponent],
    providers: [
      { provide: MAT_DIALOG_DATA, useValue: data },
      { provide: MatDialogRef, useValue: dialogRef },
      provideNoopAnimations(),
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(FocusSettingsDialogComponent);
  await fixture.whenStable();
  return { fixture, dialogRef };
}

describe('FocusSettingsDialogComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('rendering with default settings', () => {
    it('should render all form fields with default values', async () => {
      const { fixture } = await setup();
      expect(fixture.debugElement.query(By.css('[mat-dialog-title]')).nativeElement.textContent).toContain('Focus Settings');
      expect(fixture.debugElement.query(By.css('[data-testid="settings-work-duration"]')).nativeElement.value).toBe('25');
      expect(fixture.debugElement.query(By.css('[data-testid="settings-short-break"]')).nativeElement.value).toBe('5');
      expect(fixture.debugElement.query(By.css('[data-testid="settings-long-break"]')).nativeElement.value).toBe('15');
      expect(fixture.debugElement.query(By.css('[data-testid="settings-sessions-before-long"]')).nativeElement.value).toBe('4');
      expect(fixture.debugElement.query(By.css('[data-testid="settings-auto-start-breaks"]')).query(By.css('input[type="checkbox"]')).nativeElement.checked).toBeFalse();
      expect(fixture.debugElement.query(By.css('[data-testid="settings-auto-start-work"]')).query(By.css('input[type="checkbox"]')).nativeElement.checked).toBeFalse();
    });
  });

  describe('rendering with custom settings', () => {
    it('should populate fields from provided settings', async () => {
      const { fixture } = await setup(CUSTOM_SETTINGS);
      const workInput = fixture.debugElement.query(By.css('[data-testid="settings-work-duration"]'));
      expect(workInput.nativeElement.value).toBe('30');

      const shortBreak = fixture.debugElement.query(By.css('[data-testid="settings-short-break"]'));
      expect(shortBreak.nativeElement.value).toBe('10');

      const longBreak = fixture.debugElement.query(By.css('[data-testid="settings-long-break"]'));
      expect(longBreak.nativeElement.value).toBe('20');

      const sessions = fixture.debugElement.query(By.css('[data-testid="settings-sessions-before-long"]'));
      expect(sessions.nativeElement.value).toBe('3');
    });

    it('should show auto-start breaks checked when enabled', async () => {
      const { fixture } = await setup(CUSTOM_SETTINGS);
      const checkbox = fixture.debugElement.query(By.css('[data-testid="settings-auto-start-breaks"]'));
      const input = checkbox.query(By.css('input[type="checkbox"]'));
      expect(input.nativeElement.checked).toBeTrue();
    });

    it('should show auto-start work checked when enabled', async () => {
      const { fixture } = await setup(CUSTOM_SETTINGS);
      const checkbox = fixture.debugElement.query(By.css('[data-testid="settings-auto-start-work"]'));
      const input = checkbox.query(By.css('input[type="checkbox"]'));
      expect(input.nativeElement.checked).toBeTrue();
    });
  });

  describe('save', () => {
    it('should close dialog with updated settings on save', async () => {
      const { fixture, dialogRef } = await setup();

      const component = fixture.componentInstance as FocusSettingsDialogComponent & {
        workDuration: number;
        save: () => void;
      };
      component['workDuration'] = 45;
      component['save']();

      expect(dialogRef.close).toHaveBeenCalledWith(
        jasmine.objectContaining({ workDuration: 45 }),
      );
    });

    it('should return complete settings object on save', async () => {
      const { fixture, dialogRef } = await setup(CUSTOM_SETTINGS);

      const component = fixture.componentInstance as FocusSettingsDialogComponent & {
        save: () => void;
      };
      component['save']();

      expect(dialogRef.close).toHaveBeenCalledWith(CUSTOM_SETTINGS);
    });
  });

  describe('cancel', () => {
    it('should render cancel button', async () => {
      const { fixture } = await setup();
      const cancelBtn = fixture.debugElement.query(By.css('[data-testid="settings-cancel"]'));
      expect(cancelBtn).toBeTruthy();
    });

    it('should render save button', async () => {
      const { fixture } = await setup();
      const saveBtn = fixture.debugElement.query(By.css('[data-testid="settings-save"]'));
      expect(saveBtn).toBeTruthy();
      expect(saveBtn.nativeElement.textContent).toContain('Save');
    });
  });
});
