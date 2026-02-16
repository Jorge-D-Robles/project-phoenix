import { getEventColor, DEFAULT_EVENT_COLOR, EVENT_COLOR_MAP } from './calendar-event.model';

describe('Calendar Event Color Mapping', () => {
  describe('EVENT_COLOR_MAP', () => {
    it('should have 11 Google Calendar color entries', () => {
      expect(Object.keys(EVENT_COLOR_MAP).length).toBe(11);
    });

    it('should have entries keyed by string IDs 1 through 11', () => {
      for (let i = 1; i <= 11; i++) {
        expect(EVENT_COLOR_MAP[String(i)]).toBeDefined();
      }
    });

    it('should have valid hex colors for all entries', () => {
      const hexPattern = /^#[0-9A-Fa-f]{6}$/;
      for (const entry of Object.values(EVENT_COLOR_MAP)) {
        expect(entry.hex).toMatch(hexPattern);
      }
    });

    it('should have non-empty names for all entries', () => {
      for (const entry of Object.values(EVENT_COLOR_MAP)) {
        expect(entry.name.length).toBeGreaterThan(0);
      }
    });
  });

  describe('DEFAULT_EVENT_COLOR', () => {
    it('should be a valid EventColor', () => {
      expect(DEFAULT_EVENT_COLOR.name).toBeTruthy();
      expect(DEFAULT_EVENT_COLOR.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  describe('getEventColor', () => {
    it('should return the correct color for a valid colorId', () => {
      const color = getEventColor('1');
      expect(color).toBe(EVENT_COLOR_MAP['1']);
    });

    it('should return default color for null colorId', () => {
      const color = getEventColor(null);
      expect(color).toBe(DEFAULT_EVENT_COLOR);
    });

    it('should return default color for undefined colorId', () => {
      const color = getEventColor(undefined);
      expect(color).toBe(DEFAULT_EVENT_COLOR);
    });

    it('should return default color for unknown colorId', () => {
      const color = getEventColor('99');
      expect(color).toBe(DEFAULT_EVENT_COLOR);
    });

    it('should map all 11 Google color IDs correctly', () => {
      for (let i = 1; i <= 11; i++) {
        const color = getEventColor(String(i));
        expect(color.name).toBeTruthy();
        expect(color.hex).toBeTruthy();
      }
    });
  });
});
