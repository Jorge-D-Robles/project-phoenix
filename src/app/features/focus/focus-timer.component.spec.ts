import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { FocusTimerComponent } from './focus-timer.component';
import { FocusStore } from '../../state/focus.store';

function createMockStore() {
  return {
    timerStatus: signal('IDLE' as 'IDLE' | 'RUNNING' | 'PAUSED'),
    timerType: signal('WORK' as 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK'),
    remainingSeconds: signal(0),
    linkedTaskId: signal<string | null>(null),
    linkedTaskTitle: signal<string | null>(null),
    settings: signal({
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsBeforeLongBreak: 4,
      autoStartBreaks: false,
      autoStartWork: false,
    }),
    startTimer: jasmine.createSpy('startTimer'),
    pauseTimer: jasmine.createSpy('pauseTimer'),
    resumeTimer: jasmine.createSpy('resumeTimer'),
    stopTimer: jasmine.createSpy('stopTimer'),
    unlinkTask: jasmine.createSpy('unlinkTask'),
    updateSettings: jasmine.createSpy('updateSettings'),
    requestNotificationPermission: jasmine.createSpy('requestNotificationPermission').and.resolveTo(undefined),
  };
}

describe('FocusTimerComponent', () => {
  let fixture: ComponentFixture<FocusTimerComponent>;
  let mockStore: ReturnType<typeof createMockStore>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    mockStore = createMockStore();
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [FocusTimerComponent],
      providers: [
        { provide: FocusStore, useValue: mockStore },
        { provide: MatDialog, useValue: mockDialog },
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FocusTimerComponent);
  });

  describe('idle state', () => {
    it('should render play button when idle', async () => {
      await fixture.whenStable();
      const startBtn = fixture.debugElement.query(By.css('[data-testid="focus-start-btn"]'));
      expect(startBtn).toBeTruthy();
    });

    it('should render Focus label when idle', async () => {
      await fixture.whenStable();
      const label = fixture.debugElement.query(By.css('[data-testid="focus-label"]'));
      expect(label).toBeTruthy();
      expect(label.nativeElement.textContent).toContain('Focus');
    });

    it('should not render timer display when idle', async () => {
      await fixture.whenStable();
      const timer = fixture.debugElement.query(By.css('[data-testid="focus-timer-display"]'));
      expect(timer).toBeFalsy();
    });

    it('should call startTimer on play click', async () => {
      await fixture.whenStable();
      const startBtn = fixture.debugElement.query(By.css('[data-testid="focus-start-btn"]'));
      startBtn.nativeElement.click();
      expect(mockStore.startTimer).toHaveBeenCalled();
    });

    it('should call requestNotificationPermission before startTimer on play click', async () => {
      const callOrder: string[] = [];
      mockStore.requestNotificationPermission.and.callFake(() => {
        callOrder.push('requestNotificationPermission');
        return Promise.resolve(undefined);
      });
      mockStore.startTimer.and.callFake(() => {
        callOrder.push('startTimer');
      });

      await fixture.whenStable();
      const startBtn = fixture.debugElement.query(By.css('[data-testid="focus-start-btn"]'));
      startBtn.nativeElement.click();

      expect(mockStore.requestNotificationPermission).toHaveBeenCalled();
      expect(callOrder[0]).toBe('requestNotificationPermission');
      expect(callOrder[1]).toBe('startTimer');
    });
  });

  describe('running state', () => {
    beforeEach(async () => {
      mockStore.timerStatus.set('RUNNING');
      mockStore.remainingSeconds.set(1500); // 25:00
      await fixture.whenStable();
    });

    it('should render timer display when running', () => {
      const timer = fixture.debugElement.query(By.css('[data-testid="focus-timer-display"]'));
      expect(timer).toBeTruthy();
      expect(timer.nativeElement.textContent).toContain('25:00');
    });

    it('should render pause button when running', () => {
      const pauseBtn = fixture.debugElement.query(By.css('[data-testid="focus-pause-btn"]'));
      expect(pauseBtn).toBeTruthy();
    });

    it('should render stop button when running', () => {
      const stopBtn = fixture.debugElement.query(By.css('[data-testid="focus-stop-btn"]'));
      expect(stopBtn).toBeTruthy();
    });

    it('should not render play/start button when running', () => {
      const startBtn = fixture.debugElement.query(By.css('[data-testid="focus-start-btn"]'));
      expect(startBtn).toBeFalsy();
    });

    it('should call pauseTimer on pause click', () => {
      const pauseBtn = fixture.debugElement.query(By.css('[data-testid="focus-pause-btn"]'));
      pauseBtn.nativeElement.click();
      expect(mockStore.pauseTimer).toHaveBeenCalled();
    });

    it('should call stopTimer on stop click', () => {
      const stopBtn = fixture.debugElement.query(By.css('[data-testid="focus-stop-btn"]'));
      stopBtn.nativeElement.click();
      expect(mockStore.stopTimer).toHaveBeenCalled();
    });
  });

  describe('paused state', () => {
    beforeEach(async () => {
      mockStore.timerStatus.set('PAUSED');
      mockStore.remainingSeconds.set(900); // 15:00
      await fixture.whenStable();
    });

    it('should render timer display when paused', () => {
      const timer = fixture.debugElement.query(By.css('[data-testid="focus-timer-display"]'));
      expect(timer).toBeTruthy();
      expect(timer.nativeElement.textContent).toContain('15:00');
    });

    it('should render resume button when paused', () => {
      const resumeBtn = fixture.debugElement.query(By.css('[data-testid="focus-resume-btn"]'));
      expect(resumeBtn).toBeTruthy();
    });

    it('should call resumeTimer on resume click', () => {
      const resumeBtn = fixture.debugElement.query(By.css('[data-testid="focus-resume-btn"]'));
      resumeBtn.nativeElement.click();
      expect(mockStore.resumeTimer).toHaveBeenCalled();
    });
  });

  describe('linked task', () => {
    it('should show linked task title when linked', async () => {
      mockStore.timerStatus.set('RUNNING');
      mockStore.remainingSeconds.set(1500);
      mockStore.linkedTaskId.set('task-1');
      mockStore.linkedTaskTitle.set('My Task');
      await fixture.whenStable();

      const taskEl = fixture.debugElement.query(By.css('[data-testid="focus-linked-task"]'));
      expect(taskEl).toBeTruthy();
      expect(taskEl.nativeElement.textContent).toContain('My Task');
    });

    it('should not show linked task when not linked', async () => {
      mockStore.timerStatus.set('RUNNING');
      mockStore.remainingSeconds.set(1500);
      await fixture.whenStable();

      const taskEl = fixture.debugElement.query(By.css('[data-testid="focus-linked-task"]'));
      expect(taskEl).toBeFalsy();
    });

    it('should show unlink button when task is linked', async () => {
      mockStore.linkedTaskId.set('task-1');
      mockStore.linkedTaskTitle.set('My Task');
      await fixture.whenStable();

      const unlinkBtn = fixture.debugElement.query(By.css('[data-testid="focus-unlink-btn"]'));
      expect(unlinkBtn).toBeTruthy();
    });

    it('should call unlinkTask on unlink click', async () => {
      mockStore.linkedTaskId.set('task-1');
      mockStore.linkedTaskTitle.set('My Task');
      await fixture.whenStable();

      const unlinkBtn = fixture.debugElement.query(By.css('[data-testid="focus-unlink-btn"]'));
      unlinkBtn.nativeElement.click();
      expect(mockStore.unlinkTask).toHaveBeenCalled();
    });
  });

  describe('settings', () => {
    it('should render settings button', async () => {
      await fixture.whenStable();
      const settingsBtn = fixture.debugElement.query(By.css('[data-testid="focus-settings-btn"]'));
      expect(settingsBtn).toBeTruthy();
    });

    it('should open settings dialog on click', async () => {
      const afterClosedSpy = jasmine.createSpyObj('afterClosed', ['subscribe']);
      afterClosedSpy.subscribe.and.callFake(() => {});
      mockDialog.open.and.returnValue({ afterClosed: () => afterClosedSpy } as any);
      await fixture.whenStable();

      const settingsBtn = fixture.debugElement.query(By.css('[data-testid="focus-settings-btn"]'));
      settingsBtn.nativeElement.click();

      expect(mockDialog.open).toHaveBeenCalled();
    });
  });

  describe('time formatting', () => {
    it('should format single-digit seconds with leading zero', async () => {
      mockStore.timerStatus.set('RUNNING');
      mockStore.remainingSeconds.set(65); // 01:05
      await fixture.whenStable();

      const timer = fixture.debugElement.query(By.css('[data-testid="focus-timer-display"]'));
      expect(timer.nativeElement.textContent).toContain('01:05');
    });

    it('should format zero time as 00:00', async () => {
      mockStore.timerStatus.set('RUNNING');
      mockStore.remainingSeconds.set(0);
      await fixture.whenStable();

      const timer = fixture.debugElement.query(By.css('[data-testid="focus-timer-display"]'));
      expect(timer.nativeElement.textContent).toContain('00:00');
    });
  });
});
