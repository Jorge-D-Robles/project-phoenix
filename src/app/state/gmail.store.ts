import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

import type { GmailMessage } from '../data/models/gmail.model';
import { GmailService } from '../data/gmail.service';

interface GmailState {
  readonly messages: GmailMessage[];
  readonly loading: boolean;
  readonly error: string | null;
}

const initialState: GmailState = {
  messages: [],
  loading: false,
  error: null,
};

export const GmailStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ messages }) => ({
    unreadCount: computed(() => messages().filter(m => m.isUnread).length),
    recentMessages: computed(() => messages().slice(0, 5)),
    hasUnread: computed(() => messages().some(m => m.isUnread)),
  })),
  withMethods((store, gmailService = inject(GmailService)) => ({
    async loadInbox(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const messages = await firstValueFrom(gmailService.getUnreadMessages());
        patchState(store, { messages, loading: false });
      } catch {
        patchState(store, { error: 'Failed to load inbox', loading: false });
      }
    },

    async refresh(): Promise<void> {
      try {
        const messages = await firstValueFrom(gmailService.getUnreadMessages());
        patchState(store, { messages, error: null });
      } catch {
        patchState(store, { error: 'Failed to refresh inbox' });
      }
    },
  })),
);
