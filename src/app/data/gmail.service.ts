import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, forkJoin, of, switchMap } from 'rxjs';
import type {
  GoogleGmailMessage,
  GoogleGmailListResponse,
  GmailMessage,
} from './models/gmail.model';

const BASE_URL = 'https://www.googleapis.com/gmail/v1/users/me';

@Injectable({ providedIn: 'root' })
export class GmailService {
  private readonly http = inject(HttpClient);

  /** Fetch up to 10 unread inbox messages with metadata */
  getUnreadMessages(maxResults = 10): Observable<GmailMessage[]> {
    const params = new HttpParams()
      .set('q', 'is:unread in:inbox')
      .set('maxResults', maxResults.toString());

    return this.http.get<GoogleGmailListResponse>(`${BASE_URL}/messages`, { params }).pipe(
      switchMap(res => {
        const ids = res.messages ?? [];
        if (ids.length === 0) return of([]);
        return forkJoin(
          ids.map(msg => this.getMessage(msg.id)),
        );
      }),
    );
  }

  /** Get a single message with metadata format */
  private getMessage(messageId: string): Observable<GmailMessage> {
    const params = new HttpParams()
      .set('format', 'metadata')
      .set('metadataHeaders', 'From')
      .set('metadataHeaders', 'Subject')
      .set('metadataHeaders', 'Date');

    return this.http.get<GoogleGmailMessage>(`${BASE_URL}/messages/${messageId}`, { params }).pipe(
      map(raw => this.mapMessage(raw)),
    );
  }

  private mapMessage(raw: GoogleGmailMessage): GmailMessage {
    const headers = raw.payload?.headers ?? [];
    const getHeader = (name: string) =>
      headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value ?? '';

    return {
      id: raw.id,
      threadId: raw.threadId,
      from: getHeader('From'),
      subject: getHeader('Subject') || '(No subject)',
      snippet: raw.snippet ?? '',
      date: getHeader('Date'),
      isUnread: raw.labelIds?.includes('UNREAD') ?? false,
    };
  }
}
