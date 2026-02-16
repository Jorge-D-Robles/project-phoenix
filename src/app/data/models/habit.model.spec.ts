import {
  Habit,
  HabitFrequency,
  HabitLog,
  HabitsData,
  GoogleDriveFile,
  GoogleDriveFileList,
  getLevel,
} from './habit.model';

describe('Habit Model', () => {
  describe('HabitFrequency', () => {
    it('should accept DAILY as a valid frequency', () => {
      const freq: HabitFrequency = 'DAILY';
      expect(freq).toBe('DAILY');
    });

    it('should accept WEEKLY as a valid frequency', () => {
      const freq: HabitFrequency = 'WEEKLY';
      expect(freq).toBe('WEEKLY');
    });

    it('should accept MONTHLY as a valid frequency', () => {
      const freq: HabitFrequency = 'MONTHLY';
      expect(freq).toBe('MONTHLY');
    });
  });

  describe('Habit interface', () => {
    it('should accept a valid Habit object', () => {
      const habit: Habit = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Exercise',
        frequency: 'DAILY',
        targetValue: 1,
        color: '#4CAF50',
        archived: false,
        created: '2026-02-16T00:00:00Z',
        lastModified: '2026-02-16T00:00:00Z',
      };
      expect(habit.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(habit.title).toBe('Exercise');
      expect(habit.frequency).toBe('DAILY');
      expect(habit.targetValue).toBe(1);
      expect(habit.color).toBe('#4CAF50');
      expect(habit.archived).toBe(false);
      expect(habit.created).toBe('2026-02-16T00:00:00Z');
      expect(habit.lastModified).toBe('2026-02-16T00:00:00Z');
    });
  });

  describe('HabitLog interface', () => {
    it('should accept a valid HabitLog object', () => {
      const log: HabitLog = {
        habitId: '550e8400-e29b-41d4-a716-446655440000',
        date: '2026-02-16',
        value: 3,
      };
      expect(log.habitId).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(log.date).toBe('2026-02-16');
      expect(log.value).toBe(3);
    });
  });

  describe('HabitsData interface', () => {
    it('should accept a valid HabitsData object', () => {
      const data: HabitsData = {
        habits: [],
        logs: [],
      };
      expect(data.habits).toEqual([]);
      expect(data.logs).toEqual([]);
    });
  });

  describe('GoogleDriveFile interface', () => {
    it('should accept a valid GoogleDriveFile', () => {
      const file: GoogleDriveFile = {
        id: 'file-id-123',
        name: 'habits.json',
        mimeType: 'application/json',
      };
      expect(file.id).toBe('file-id-123');
      expect(file.name).toBe('habits.json');
      expect(file.mimeType).toBe('application/json');
    });
  });

  describe('GoogleDriveFileList interface', () => {
    it('should accept a GoogleDriveFileList with files', () => {
      const list: GoogleDriveFileList = {
        files: [{ id: 'f1', name: 'habits.json', mimeType: 'application/json' }],
      };
      expect(list.files?.length).toBe(1);
    });

    it('should accept a GoogleDriveFileList without files', () => {
      const list: GoogleDriveFileList = {};
      expect(list.files).toBeUndefined();
    });
  });

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
