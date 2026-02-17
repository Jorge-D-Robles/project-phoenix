import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { FocusStore } from './focus.store';
import { FocusService } from '../data/focus.service';
import { DEFAULT_FOCUS_SETTINGS } from '../data/models/focus-session.model';
import type { FocusSession, FocusSettings } from '../data/models/focus-session.model';

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

const MOCK_SESSIONS: FocusSession[] = [
  {
    id: 'fs1',
    taskId: 't1',
    taskTitle: 'Write report',
    startTime: `${todayISO()}T10:00:00Z`,
    plannedDuration: 25,
    actualDuration: 25,
    completed: true,
    type: 'WORK',
  },
  {
    id: 'fs2',
    taskId: null,
    taskTitle: null,
    startTime: `${yesterdayISO()}T14:00:00Z`,
    plannedDuration: 25,
    actualDuration: 25,
    completed: true,
    type: 'WORK',
  },
];

const MOCK_SETTINGS: FocusSettings = {
  workDuration: 30,
  shortBreakDuration: 10,
  longBreakDuration: 20,
  sessionsBeforeLongBreak: 3,
  autoStartBreaks: false,
  autoStartWork: false,
};

describe('FocusStore', () => {
  let store: InstanceType<typeof FocusStore>;
  let mockFocusService: jasmine.SpyObj<FocusService>;

  beforeEach(() => {
    mockFocusService = jasmine.createSpyObj('FocusService', [
      'loadSessions', 'saveSessions', 'loadSettings', 'saveSettings',
    ]);
    mockFocusService.loadSessions.and.returnValue(of(MOCK_SESSIONS));
    mockFocusService.saveSessions.and.returnValue(of(undefined));
    mockFocusService.loadSettings.and.returnValue(of(MOCK_SETTINGS));
    mockFocusService.saveSettings.and.returnValue(of(undefined));

    TestBed.configureTestingModule({
      providers: [
        FocusStore,
        { provide: FocusService, useValue: mockFocusService },
      ],
    });

    store = TestBed.inject(FocusStore);
  });

  describe('initial state', () => {
    it('should have empty sessions array', () => {
      expect(store.sessions()).toEqual([]);
    });

    it('should have default settings', () => {
      expect(store.settings()).toEqual(DEFAULT_FOCUS_SETTINGS);
    });

    it('should not be loading', () => {
      expect(store.loading()).toBe(false);
    });

    it('should have null error', () => {
      expect(store.error()).toBeNull();
    });

    it('should have IDLE timerStatus', () => {
      expect(store.timerStatus()).toBe('IDLE');
    });

    it('should have WORK timerType', () => {
      expect(store.timerType()).toBe('WORK');
    });

    it('should have zero remainingSeconds', () => {
      expect(store.remainingSeconds()).toBe(0);
    });

    it('should have null currentSessionStart', () => {
      expect(store.currentSessionStart()).toBeNull();
    });

    it('should have null linkedTaskId', () => {
      expect(store.linkedTaskId()).toBeNull();
    });

    it('should have null linkedTaskTitle', () => {
      expect(store.linkedTaskTitle()).toBeNull();
    });

    it('should have zero sessionsCompleted', () => {
      expect(store.sessionsCompleted()).toBe(0);
    });
  });

  describe('method: loadData', () => {
    it('should set loading while fetching', async () => {
      const promise = store.loadData();
      expect(store.loading()).toBe(true);
      await promise;
      expect(store.loading()).toBe(false);
    });

    it('should populate sessions from service', async () => {
      await store.loadData();
      expect(store.sessions().length).toBe(2);
    });

    it('should populate settings from service', async () => {
      await store.loadData();
      expect(store.settings()).toEqual(MOCK_SETTINGS);
    });

    it('should call loadSessions on the service', async () => {
      await store.loadData();
      expect(mockFocusService.loadSessions).toHaveBeenCalled();
    });

    it('should call loadSettings on the service', async () => {
      await store.loadData();
      expect(mockFocusService.loadSettings).toHaveBeenCalled();
    });

    it('should set error on failure', async () => {
      mockFocusService.loadSessions.and.returnValue(
        throwError(() => new Error('Network error')),
      );
      await store.loadData();
      expect(store.error()).toBe('Failed to load focus data');
      expect(store.loading()).toBe(false);
    });
  });

  describe('method: startTimer', () => {
    beforeEach(async () => {
      await store.loadData();
    });

    afterEach(() => {
      // Ensure timer is stopped to clean up intervals
      if (store.timerStatus() !== 'IDLE') {
        store.stopTimer();
      }
    });

    it('should set timerStatus to RUNNING', () => {
      store.startTimer();
      expect(store.timerStatus()).toBe('RUNNING');
    });

    it('should set remainingSeconds from settings workDuration', () => {
      store.startTimer();
      expect(store.remainingSeconds()).toBe(MOCK_SETTINGS.workDuration * 60);
    });

    it('should set currentSessionStart to a valid ISO string', () => {
      store.startTimer();
      expect(store.currentSessionStart()).toBeTruthy();
      const date = new Date(store.currentSessionStart()!);
      expect(date.toISOString()).toBe(store.currentSessionStart()!);
    });

    it('should use break duration when timerType is SHORT_BREAK', () => {
      // Simulate a completed work session by starting and completing
      store.startTimer();
      store.stopTimer();
      // Manually transition to break for testing
      store.startBreak('SHORT_BREAK');
      expect(store.remainingSeconds()).toBe(MOCK_SETTINGS.shortBreakDuration * 60);
    });
  });

  describe('method: pauseTimer', () => {
    beforeEach(async () => {
      await store.loadData();
      store.startTimer();
    });

    afterEach(() => {
      if (store.timerStatus() !== 'IDLE') {
        store.stopTimer();
      }
    });

    it('should set timerStatus to PAUSED', () => {
      store.pauseTimer();
      expect(store.timerStatus()).toBe('PAUSED');
    });

    it('should preserve remainingSeconds', () => {
      const before = store.remainingSeconds();
      store.pauseTimer();
      expect(store.remainingSeconds()).toBe(before);
    });
  });

  describe('method: resumeTimer', () => {
    beforeEach(async () => {
      await store.loadData();
      store.startTimer();
      store.pauseTimer();
    });

    afterEach(() => {
      if (store.timerStatus() !== 'IDLE') {
        store.stopTimer();
      }
    });

    it('should set timerStatus to RUNNING', () => {
      store.resumeTimer();
      expect(store.timerStatus()).toBe('RUNNING');
    });
  });

  describe('method: stopTimer', () => {
    beforeEach(async () => {
      await store.loadData();
      store.startTimer();
    });

    it('should set timerStatus to IDLE', () => {
      store.stopTimer();
      expect(store.timerStatus()).toBe('IDLE');
    });

    it('should reset remainingSeconds to 0', () => {
      store.stopTimer();
      expect(store.remainingSeconds()).toBe(0);
    });

    it('should clear currentSessionStart', () => {
      store.stopTimer();
      expect(store.currentSessionStart()).toBeNull();
    });

    it('should save a partial session with completed=false', () => {
      store.stopTimer();
      expect(mockFocusService.saveSessions).toHaveBeenCalled();
      const savedSessions = mockFocusService.saveSessions.calls.mostRecent().args[0];
      const partial = savedSessions.find((s: FocusSession) => !s.completed);
      expect(partial).toBeTruthy();
      expect(partial!.completed).toBe(false);
    });
  });

  describe('method: tick', () => {
    beforeEach(async () => {
      await store.loadData();
    });

    afterEach(() => {
      if (store.timerStatus() !== 'IDLE') {
        store.stopTimer();
      }
    });

    it('should decrement remainingSeconds by 1', () => {
      store.startTimer();
      const before = store.remainingSeconds();
      store.tick();
      expect(store.remainingSeconds()).toBe(before - 1);
    });
  });

  describe('timer completion', () => {
    beforeEach(async () => {
      await store.loadData();
    });

    afterEach(() => {
      if (store.timerStatus() !== 'IDLE') {
        store.stopTimer();
      }
    });

    it('should save completed session when work timer reaches 0', () => {
      store.startTimer();
      // Simulate ticking down to 1 second remaining
      while (store.remainingSeconds() > 1) {
        store.tick();
      }
      mockFocusService.saveSessions.calls.reset();
      store.tick(); // reaches 0
      expect(mockFocusService.saveSessions).toHaveBeenCalled();
    });

    it('should increment sessionsCompleted when work session finishes', () => {
      store.startTimer();
      while (store.remainingSeconds() > 1) {
        store.tick();
      }
      store.tick();
      expect(store.sessionsCompleted()).toBe(1);
    });

    it('should transition to SHORT_BREAK after work session completes', () => {
      store.startTimer();
      while (store.remainingSeconds() > 1) {
        store.tick();
      }
      store.tick();
      expect(store.timerType()).toBe('SHORT_BREAK');
    });
  });

  describe('method: linkTask / unlinkTask', () => {
    it('should set linkedTaskId and linkedTaskTitle', () => {
      store.linkTask('task-1', 'My Task');
      expect(store.linkedTaskId()).toBe('task-1');
      expect(store.linkedTaskTitle()).toBe('My Task');
    });

    it('should clear linked task on unlinkTask', () => {
      store.linkTask('task-1', 'My Task');
      store.unlinkTask();
      expect(store.linkedTaskId()).toBeNull();
      expect(store.linkedTaskTitle()).toBeNull();
    });
  });

  describe('method: updateSettings', () => {
    beforeEach(async () => {
      await store.loadData();
    });

    it('should merge partial settings updates', async () => {
      await store.updateSettings({ workDuration: 50 });
      expect(store.settings().workDuration).toBe(50);
      // Other settings should remain unchanged
      expect(store.settings().shortBreakDuration).toBe(MOCK_SETTINGS.shortBreakDuration);
    });

    it('should persist settings to the service', async () => {
      mockFocusService.saveSettings.calls.reset();
      await store.updateSettings({ workDuration: 50 });
      expect(mockFocusService.saveSettings).toHaveBeenCalled();
    });
  });

  describe('computed: todaySessions', () => {
    it('should filter sessions to only today', async () => {
      await store.loadData();
      const today = store.todaySessions();
      // Only the session from 2026-02-16 should be included
      expect(today.length).toBe(1);
      expect(today[0].id).toBe('fs1');
    });
  });

  describe('computed: todayFocusMinutes', () => {
    it('should sum actualDuration for today WORK sessions', async () => {
      await store.loadData();
      expect(store.todayFocusMinutes()).toBe(25);
    });

    it('should be 0 when no sessions loaded', () => {
      expect(store.todayFocusMinutes()).toBe(0);
    });
  });

  /** Helper that temporarily replaces window.Notification and restores it afterward */
  function withNotificationMock(
    permission: NotificationPermission,
    fn: (notificationSpy: jasmine.Spy) => void,
  ): void {
    const original = window.Notification;
    const notificationSpy = jasmine.createSpy('Notification');
    const mockNotification = Object.assign(notificationSpy, { permission }) as unknown as typeof Notification;
    Object.defineProperty(window, 'Notification', { value: mockNotification, configurable: true, writable: true });
    try {
      fn(notificationSpy);
    } finally {
      Object.defineProperty(window, 'Notification', { value: original, configurable: true, writable: true });
    }
  }

  describe('method: requestNotificationPermission', () => {
    it('should call Notification.requestPermission when permission is default', async () => {
      const requestPermissionSpy = jasmine.createSpy('requestPermission').and.resolveTo('granted' as NotificationPermission);
      const original = window.Notification;
      const mockNotification = Object.assign(
        jasmine.createSpy('Notification'),
        { permission: 'default' as NotificationPermission, requestPermission: requestPermissionSpy },
      ) as unknown as typeof Notification;
      Object.defineProperty(window, 'Notification', { value: mockNotification, configurable: true, writable: true });

      await store.requestNotificationPermission();

      expect(requestPermissionSpy).toHaveBeenCalled();
      Object.defineProperty(window, 'Notification', { value: original, configurable: true, writable: true });
    });

    it('should not call requestPermission when permission is already granted', async () => {
      const requestPermissionSpy = jasmine.createSpy('requestPermission').and.resolveTo('granted' as NotificationPermission);
      const original = window.Notification;
      const mockNotification = Object.assign(
        jasmine.createSpy('Notification'),
        { permission: 'granted' as NotificationPermission, requestPermission: requestPermissionSpy },
      ) as unknown as typeof Notification;
      Object.defineProperty(window, 'Notification', { value: mockNotification, configurable: true, writable: true });

      await store.requestNotificationPermission();

      expect(requestPermissionSpy).not.toHaveBeenCalled();
      Object.defineProperty(window, 'Notification', { value: original, configurable: true, writable: true });
    });

    it('should not call requestPermission when permission is denied', async () => {
      const requestPermissionSpy = jasmine.createSpy('requestPermission').and.resolveTo('denied' as NotificationPermission);
      const original = window.Notification;
      const mockNotification = Object.assign(
        jasmine.createSpy('Notification'),
        { permission: 'denied' as NotificationPermission, requestPermission: requestPermissionSpy },
      ) as unknown as typeof Notification;
      Object.defineProperty(window, 'Notification', { value: mockNotification, configurable: true, writable: true });

      await store.requestNotificationPermission();

      expect(requestPermissionSpy).not.toHaveBeenCalled();
      Object.defineProperty(window, 'Notification', { value: original, configurable: true, writable: true });
    });
  });

  describe('notifications on timer complete', () => {
    beforeEach(async () => {
      await store.loadData();
    });

    afterEach(() => {
      if (store.timerStatus() !== 'IDLE') {
        store.stopTimer();
      }
    });

    it('should fire a Notification when work timer completes and permission is granted', () => {
      withNotificationMock('granted', (notificationSpy) => {
        store.startTimer();
        while (store.remainingSeconds() > 1) {
          store.tick();
        }
        store.tick();

        expect(notificationSpy).toHaveBeenCalledWith(
          'Focus Session Complete',
          jasmine.objectContaining({ body: 'Time for a break! Great work.' }),
        );
      });
    });

    it('should not fire a Notification when permission is not granted', () => {
      withNotificationMock('denied', (notificationSpy) => {
        store.startTimer();
        while (store.remainingSeconds() > 1) {
          store.tick();
        }
        store.tick();

        expect(notificationSpy).not.toHaveBeenCalled();
      });
    });

    it('should still transition state correctly when timer completes (regression)', () => {
      store.startTimer();
      while (store.remainingSeconds() > 1) {
        store.tick();
      }
      store.tick();

      expect(store.sessionsCompleted()).toBe(1);
      expect(store.timerType()).toBe('SHORT_BREAK');
      expect(store.timerStatus()).toBe('IDLE');
    });
  });

  describe('error handling', () => {
    it('should set error when save sessions fails', async () => {
      await store.loadData();
      mockFocusService.saveSessions.and.returnValue(
        throwError(() => new Error('Save failed')),
      );
      store.startTimer();
      store.stopTimer();
      // saveSessions is fire-and-forget async; wait for the microtask to settle
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(store.error()).toBe('Failed to save focus data');
    });

    it('should set error when save settings fails', async () => {
      await store.loadData();
      mockFocusService.saveSettings.and.returnValue(
        throwError(() => new Error('Save failed')),
      );
      await store.updateSettings({ workDuration: 50 });
      expect(store.error()).toBe('Failed to save focus settings');
    });
  });
});
