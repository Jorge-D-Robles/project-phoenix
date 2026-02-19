import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { GmailService } from './gmail.service';
import type { GoogleGmailListResponse, GoogleGmailMessage } from './models/gmail.model';

describe('GmailService', () => {
  let service: GmailService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(GmailService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return empty array when no messages', () => {
    service.getUnreadMessages().subscribe(messages => {
      expect(messages).toEqual([]);
    });

    const req = httpMock.expectOne(r => r.url.includes('/messages') && !r.url.includes('/messages/'));
    req.flush({ messages: [], resultSizeEstimate: 0 } as GoogleGmailListResponse);
  });

  it('should fetch and map unread messages', () => {
    const mockRaw: GoogleGmailMessage = {
      id: 'msg-1',
      threadId: 'thread-1',
      snippet: 'Hello world',
      payload: {
        headers: [
          { name: 'From', value: 'alice@example.com' },
          { name: 'Subject', value: 'Test Subject' },
          { name: 'Date', value: '2026-02-18T10:00:00Z' },
        ],
      },
      labelIds: ['INBOX', 'UNREAD'],
    };

    service.getUnreadMessages(5).subscribe(messages => {
      expect(messages.length).toBe(1);
      expect(messages[0].from).toBe('alice@example.com');
      expect(messages[0].subject).toBe('Test Subject');
      expect(messages[0].snippet).toBe('Hello world');
      expect(messages[0].isUnread).toBeTrue();
    });

    const listReq = httpMock.expectOne(r => r.url.includes('/messages') && !r.url.includes('/messages/'));
    listReq.flush({ messages: [{ id: 'msg-1', threadId: 'thread-1' }], resultSizeEstimate: 1 });

    const getReq = httpMock.expectOne(r => r.url.includes('/messages/msg-1'));
    getReq.flush(mockRaw);
  });
});
