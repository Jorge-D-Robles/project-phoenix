import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { JournalStore } from './journal.store';

describe('JournalStore', () => {
  let store: InstanceType<typeof JournalStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(JournalStore);
  });

  it('should be created with initial state', () => {
    expect(store).toBeTruthy();
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
  });

  it('should compute todayEntry as null when no journal notes', () => {
    expect(store.todayEntry()).toBeNull();
  });

  it('should compute allEntries as empty when no journal notes', () => {
    expect(store.allEntries()).toEqual([]);
  });

  it('should compute recentEntries as empty when no journal notes', () => {
    expect(store.recentEntries()).toEqual([]);
  });
});
