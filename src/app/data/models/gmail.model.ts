/** Gmail API message resource (raw shape) */
export interface GoogleGmailMessage {
  readonly id: string;
  readonly threadId: string;
  readonly snippet?: string;
  readonly payload?: {
    readonly headers?: readonly { readonly name: string; readonly value: string }[];
  };
  readonly labelIds?: readonly string[];
}

/** Gmail API messages.list response */
export interface GoogleGmailListResponse {
  readonly messages?: readonly { readonly id: string; readonly threadId: string }[];
  readonly resultSizeEstimate?: number;
}

/** Gmail API profile response */
export interface GoogleGmailProfile {
  readonly emailAddress: string;
  readonly messagesTotal: number;
  readonly threadsTotal: number;
}

/** Phoenix representation of a Gmail message */
export interface GmailMessage {
  readonly id: string;
  readonly threadId: string;
  readonly from: string;
  readonly subject: string;
  readonly snippet: string;
  readonly date: string;
  readonly isUnread: boolean;
}
