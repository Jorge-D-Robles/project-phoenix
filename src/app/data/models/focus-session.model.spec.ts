import { DEFAULT_FOCUS_SETTINGS } from './focus-session.model';
import type { FocusSettings } from './focus-session.model';

describe('FocusSession model', () => {
  describe('DEFAULT_FOCUS_SETTINGS', () => {
    it('should have workDuration of 25 minutes', () => {
      expect(DEFAULT_FOCUS_SETTINGS.workDuration).toBe(25);
    });

    it('should have shortBreakDuration of 5 minutes', () => {
      expect(DEFAULT_FOCUS_SETTINGS.shortBreakDuration).toBe(5);
    });

    it('should have longBreakDuration of 15 minutes', () => {
      expect(DEFAULT_FOCUS_SETTINGS.longBreakDuration).toBe(15);
    });

    it('should have sessionsBeforeLongBreak of 4', () => {
      expect(DEFAULT_FOCUS_SETTINGS.sessionsBeforeLongBreak).toBe(4);
    });

    it('should have autoStartBreaks as false', () => {
      expect(DEFAULT_FOCUS_SETTINGS.autoStartBreaks).toBe(false);
    });

    it('should have autoStartWork as false', () => {
      expect(DEFAULT_FOCUS_SETTINGS.autoStartWork).toBe(false);
    });

    it('should satisfy FocusSettings interface', () => {
      const settings: FocusSettings = DEFAULT_FOCUS_SETTINGS;
      expect(settings).toBeTruthy();
    });
  });
});
