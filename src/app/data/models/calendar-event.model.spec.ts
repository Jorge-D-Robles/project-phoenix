import { getEventColor, DEFAULT_EVENT_COLOR, EVENT_COLOR_MAP } from './calendar-event.model';

describe('Calendar Event Color Mapping', () => {
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
