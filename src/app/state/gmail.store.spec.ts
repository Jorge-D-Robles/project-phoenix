import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { GmailStore } from './gmail.store';

describe('GmailStore', () => {
  let store: InstanceType<typeof GmailStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(GmailStore);
  });

  it('should be created with initial state', () => {
    expect(store).toBeTruthy();
    expect(store.messages()).toEqual([]);
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
  });

  it('should compute unread count', () => {
    expect(store.unreadCount()).toBe(0);
  });

  it('should compute hasUnread as false when empty', () => {
    expect(store.hasUnread()).toBeFalse();
  });

  it('should compute recentMessages as empty when no messages', () => {
    expect(store.recentMessages()).toEqual([]);
  });
});
