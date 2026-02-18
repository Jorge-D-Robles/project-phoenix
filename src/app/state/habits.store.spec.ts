import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { HabitsStore } from './habits.store';
import { HabitService } from '../data/habit.service';
import type { Habit, HabitLog, HabitsData } from '../data/models/habit.model';

const MOCK_HABITS: Habit[] = [
  {
    id: 'h1',
    title: 'Exercise',
    frequency: 'DAILY',
    targetValue: 1,
    color: '#4CAF50',
    archived: false,
    created: '2026-02-01T00:00:00Z',
    lastModified: '2026-02-01T00:00:00Z',
  },
  {
    id: 'h2',
    title: 'Read',
    frequency: 'DAILY',
    targetValue: 30,
    color: '#2196F3',
    archived: false,
    created: '2026-02-01T00:00:00Z',
    lastModified: '2026-02-01T00:00:00Z',
  },
  {
    id: 'h3',
    title: 'Old Habit',
    frequency: 'WEEKLY',
    targetValue: 3,
    color: '#FF9800',
    archived: true,
    created: '2026-01-01T00:00:00Z',
    lastModified: '2026-01-15T00:00:00Z',
  },
];

const MOCK_LOGS: HabitLog[] = [
  { habitId: 'h1', date: '2026-02-16', value: 1 },
  { habitId: 'h1', date: '2026-02-15', value: 1 },
  { habitId: 'h2', date: '2026-02-16', value: 25 },
];

const MOCK_DATA: HabitsData = {
  habits: MOCK_HABITS,
  logs: MOCK_LOGS,
};

describe('HabitsStore', () => {
  let store: InstanceType<typeof HabitsStore>;
  let mockHabitService: jasmine.SpyObj<HabitService>;

  beforeEach(() => {
    mockHabitService = jasmine.createSpyObj('HabitService', [
      'loadData', 'saveData',
    ]);
    mockHabitService.loadData.and.returnValue(of(MOCK_DATA));
    mockHabitService.saveData.and.returnValue(of(undefined));

    TestBed.configureTestingModule({
      providers: [
        HabitsStore,
        { provide: HabitService, useValue: mockHabitService },
      ],
    });

    store = TestBed.inject(HabitsStore);
  });

  describe('initial state', () => {
    it('should have correct defaults', () => {
      expect(store.habits()).toEqual([]);
      expect(store.logs()).toEqual([]);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.selectedHabitId()).toBeNull();
    });
  });

  describe('computed: activeHabits', () => {
    it('should return only non-archived habits', async () => {
      await store.loadData();
      const active = store.activeHabits();
      expect(active.length).toBe(2);
      expect(active.every(h => !h.archived)).toBeTrue();
    });

    it('should return empty array when no habits loaded', () => {
      expect(store.activeHabits()).toEqual([]);
    });
  });

  describe('computed: selectedHabit', () => {
    it('should return null when no habit is selected', async () => {
      await store.loadData();
      expect(store.selectedHabit()).toBeNull();
    });

    it('should return the matching habit when selected', async () => {
      await store.loadData();
      store.selectHabit('h1');
      expect(store.selectedHabit()?.id).toBe('h1');
      expect(store.selectedHabit()?.title).toBe('Exercise');
    });

    it('should return null when selectedHabitId does not match', async () => {
      await store.loadData();
      store.selectHabit('nonexistent');
      expect(store.selectedHabit()).toBeNull();
    });
  });

  describe('computed: logsForSelectedHabit', () => {
    it('should return empty array when no habit is selected', async () => {
      await store.loadData();
      expect(store.logsForSelectedHabit()).toEqual([]);
    });

    it('should return only logs for the selected habit', async () => {
      await store.loadData();
      store.selectHabit('h1');
      const logs = store.logsForSelectedHabit();
      expect(logs.length).toBe(2);
      expect(logs.every(l => l.habitId === 'h1')).toBeTrue();
    });

    it('should return empty array for habit with no logs', async () => {
      await store.loadData();
      store.selectHabit('h3');
      expect(store.logsForSelectedHabit()).toEqual([]);
    });
  });

  describe('method: loadData', () => {
    it('should set loading while fetching', async () => {
      const promise = store.loadData();
      expect(store.loading()).toBe(true);
      await promise;
      expect(store.loading()).toBe(false);
    });

    it('should populate habits and logs from service', async () => {
      await store.loadData();
      expect(store.habits().length).toBe(3);
      expect(store.logs().length).toBe(3);
    });

    it('should set error on failure', async () => {
      mockHabitService.loadData.and.returnValue(
        throwError(() => new Error('Network error')),
      );
      await store.loadData();
      expect(store.error()).toBe('Failed to load habits data');
      expect(store.loading()).toBe(false);
    });
  });

  describe('method: addHabit', () => {
    beforeEach(async () => {
      await store.loadData();
    });

    it('should add a new habit to the store', async () => {
      await store.addHabit({
        title: 'Meditate',
        frequency: 'DAILY',
        targetValue: 1,
        color: '#9C27B0',
        archived: false,
      });
      expect(store.habits().length).toBe(4);
      const added = store.habits().find(h => h.title === 'Meditate');
      expect(added).toBeTruthy();
    });

    it('should generate an id for the new habit', async () => {
      await store.addHabit({
        title: 'Meditate',
        frequency: 'DAILY',
        targetValue: 1,
        color: '#9C27B0',
        archived: false,
      });
      const added = store.habits().find(h => h.title === 'Meditate');
      expect(added?.id).toBeTruthy();
      expect(added?.id.length).toBeGreaterThan(0);
    });

    it('should set created and lastModified timestamps', async () => {
      await store.addHabit({
        title: 'Meditate',
        frequency: 'DAILY',
        targetValue: 1,
        color: '#9C27B0',
        archived: false,
      });
      const added = store.habits().find(h => h.title === 'Meditate');
      expect(added?.created).toBeTruthy();
      expect(added?.lastModified).toBeTruthy();
    });

    it('should persist data to the service', async () => {
      await store.addHabit({
        title: 'Meditate',
        frequency: 'DAILY',
        targetValue: 1,
        color: '#9C27B0',
        archived: false,
      });
      expect(mockHabitService.saveData).toHaveBeenCalled();
    });
  });

  describe('method: updateHabit', () => {
    beforeEach(async () => {
      await store.loadData();
    });

    it('should update the specified habit', async () => {
      await store.updateHabit('h1', { title: 'Workout' });
      const updated = store.habits().find(h => h.id === 'h1');
      expect(updated?.title).toBe('Workout');
    });

    it('should update lastModified timestamp', async () => {
      const beforeUpdate = store.habits().find(h => h.id === 'h1')?.lastModified;
      await store.updateHabit('h1', { title: 'Workout' });
      const afterUpdate = store.habits().find(h => h.id === 'h1')?.lastModified;
      expect(afterUpdate).not.toBe(beforeUpdate);
    });

    it('should not affect other habits', async () => {
      await store.updateHabit('h1', { title: 'Workout' });
      const h2 = store.habits().find(h => h.id === 'h2');
      expect(h2?.title).toBe('Read');
    });

    it('should persist data to the service', async () => {
      mockHabitService.saveData.calls.reset();
      await store.updateHabit('h1', { title: 'Workout' });
      expect(mockHabitService.saveData).toHaveBeenCalled();
    });
  });

  describe('method: archiveHabit', () => {
    beforeEach(async () => {
      await store.loadData();
    });

    it('should set archived to true for the habit', async () => {
      await store.archiveHabit('h1');
      const habit = store.habits().find(h => h.id === 'h1');
      expect(habit?.archived).toBe(true);
    });

    it('should remove the habit from activeHabits', async () => {
      await store.archiveHabit('h1');
      const active = store.activeHabits();
      expect(active.find(h => h.id === 'h1')).toBeUndefined();
    });

    it('should persist data to the service', async () => {
      mockHabitService.saveData.calls.reset();
      await store.archiveHabit('h1');
      expect(mockHabitService.saveData).toHaveBeenCalled();
    });
  });

  describe('method: logHabit', () => {
    beforeEach(async () => {
      await store.loadData();
    });

    it('should add a new log entry', async () => {
      await store.logHabit('h2', '2026-02-15', 20);
      const logs = store.logs().filter(l => l.habitId === 'h2');
      expect(logs.length).toBe(2);
    });

    it('should update existing log entry for the same habit and date', async () => {
      await store.logHabit('h1', '2026-02-16', 5);
      const logs = store.logs().filter(l => l.habitId === 'h1' && l.date === '2026-02-16');
      expect(logs.length).toBe(1);
      expect(logs[0].value).toBe(5);
    });

    it('should persist data to the service', async () => {
      mockHabitService.saveData.calls.reset();
      await store.logHabit('h1', '2026-02-16', 1);
      expect(mockHabitService.saveData).toHaveBeenCalled();
    });
  });

  describe('method: selectHabit', () => {
    it('should set selectedHabitId', () => {
      store.selectHabit('h1');
      expect(store.selectedHabitId()).toBe('h1');
    });

    it('should clear selectedHabitId with null', () => {
      store.selectHabit('h1');
      store.selectHabit(null);
      expect(store.selectedHabitId()).toBeNull();
    });
  });

  describe('method: deleteLog', () => {
    beforeEach(async () => {
      await store.loadData();
    });

    it('should remove the matching log entry', async () => {
      await store.deleteLog('h1', '2026-02-16');
      const logs = store.logs().filter(l => l.habitId === 'h1' && l.date === '2026-02-16');
      expect(logs.length).toBe(0);
    });

    it('should not remove other log entries', async () => {
      await store.deleteLog('h1', '2026-02-16');
      // h1 log for 2026-02-15 and h2 log should remain
      expect(store.logs().length).toBe(2);
    });

    it('should persist data to the service', async () => {
      mockHabitService.saveData.calls.reset();
      await store.deleteLog('h1', '2026-02-16');
      expect(mockHabitService.saveData).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should set error when save fails', async () => {
      await store.loadData();
      mockHabitService.saveData.and.returnValue(
        throwError(() => new Error('Save failed')),
      );
      await store.addHabit({
        title: 'Fail Habit',
        frequency: 'DAILY',
        targetValue: 1,
        color: '#000000',
        archived: false,
      });
      expect(store.error()).toBe('Failed to save habits data');
    });
  });
});
