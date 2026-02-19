import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PlannerStore } from './planner.store';

describe('PlannerStore', () => {
  let store: InstanceType<typeof PlannerStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(PlannerStore);
  });

  it('should be created with initial state', () => {
    expect(store).toBeTruthy();
    expect(store.timeBlocks()).toEqual([]);
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
  });

  it('should have a selected date set to today', () => {
    const today = new Date().toISOString().substring(0, 10);
    expect(store.selectedDate()).toBe(today);
  });

  it('should update selected date', () => {
    store.setDate('2026-03-01');
    expect(store.selectedDate()).toBe('2026-03-01');
  });

  it('should compute unscheduled tasks', () => {
    expect(store.unscheduledTasks()).toBeDefined();
    expect(Array.isArray(store.unscheduledTasks())).toBeTrue();
  });

  it('should compute day events', () => {
    expect(store.dayEvents()).toBeDefined();
    expect(Array.isArray(store.dayEvents())).toBeTrue();
  });
});
