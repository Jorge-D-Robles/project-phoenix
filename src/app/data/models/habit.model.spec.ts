import { getLevel } from './habit.model';

describe('Habit Model', () => {
  describe('getLevel', () => {
    it('should return 0 for zero value', () => {
      expect(getLevel(0, 100)).toBe(0);
    });

    it('should return 0 when maxValue is 0', () => {
      expect(getLevel(5, 0)).toBe(0);
    });

    it('should return 1 for values <= 25% of max', () => {
      expect(getLevel(25, 100)).toBe(1);
    });

    it('should return 2 for values <= 50% of max', () => {
      expect(getLevel(50, 100)).toBe(2);
    });

    it('should return 3 for values <= 75% of max', () => {
      expect(getLevel(75, 100)).toBe(3);
    });

    it('should return 4 for values > 75% of max', () => {
      expect(getLevel(76, 100)).toBe(4);
    });

    it('should return 4 when value equals maxValue', () => {
      expect(getLevel(100, 100)).toBe(4);
    });

    it('should return 1 for very small non-zero value', () => {
      expect(getLevel(1, 100)).toBe(1);
    });
  });
});
