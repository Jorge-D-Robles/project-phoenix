# Google API Integration Specification

> Distilled from `design.md` §3. Refer to `design.md` for full context.

---

## Authentication: OAuth 2.0 PKCE

Both Web and Android use **OAuth 2.0 with Proof Key for Code Exchange (PKCE)** — required for public clients (no client secret).

### Incremental Scope Strategy

Request scopes only when the user accesses the corresponding feature:

| Trigger | Scopes Requested |
|---------|-----------------|
| Login (baseline) | `openid`, `email`, `profile` |
| User opens Tasks tab | `https://www.googleapis.com/auth/tasks` |
| User opens Schedule view | `https://www.googleapis.com/auth/calendar.events` |
| User opens Notes or Backup | `https://www.googleapis.com/auth/drive.file`, `https://www.googleapis.com/auth/drive.appdata` |

### AuthInterceptor / AuthAuthenticator Requirements

Implement an HTTP interceptor that:

1. Attaches the access token to every Google API request (`Authorization: Bearer <token>`)
2. Detects `401 Unauthorized` responses
3. Attempts silent token refresh using the stored refresh token
4. If refresh fails → redirect user to login screen
5. Queues concurrent requests during refresh (don't fire multiple refresh calls)

| Platform | Implementation |
|----------|---------------|
| Web (Angular) | `HttpInterceptor` — intercept outgoing requests, handle 401 |
| Android | `Authenticator` on OkHttp client — automatic 401 retry |

---

## Google Tasks API

### Key Endpoints

| Operation | Method | Endpoint | Notes |
|-----------|--------|----------|-------|
| List task lists | GET | `/tasks/v1/users/@me/lists` | First call — get all lists |
| Get tasks | GET | `/tasks/v1/lists/{listId}/tasks` | Use `showCompleted` param; paginate via `pageToken` |
| Create task | POST | `/tasks/v1/lists/{listId}/tasks` | Returns created task with server ID |
| Update task | PATCH | `/tasks/v1/lists/{listId}/tasks/{taskId}` | Partial update |
| Delete task | DELETE | `/tasks/v1/lists/{listId}/tasks/{taskId}` | Hard delete |
| Move task | POST | `/tasks/v1/lists/{listId}/tasks/{taskId}/move` | Requires `parent` and `previous` params |

### Pagination

- Always handle `nextPageToken` in responses
- Loop until `nextPageToken` is absent
- Default page size is 100; max is 100

### Move Operation

The `moveTask` endpoint requires:
- `parent`: ID of the parent task (for nesting) — omit for top-level
- `previous`: ID of the preceding sibling (for ordering) — omit for first position

This is critical for drag-and-drop reordering.

---

## Google Calendar API

### Sync Token Strategy

| Phase | Action | Parameters |
|-------|--------|------------|
| **Initial sync** | Fetch events | `timeMin=Now-30d`, `timeMax=Now+90d` |
| | Store the returned `nextSyncToken` | |
| **Incremental sync** | Fetch with sync token | `syncToken=<stored>` |
| | API returns only modified events (new, updated, cancelled) | |
| **Token invalidated** | If `410 Gone` response | Discard token, do full initial sync |

### Event Mapping Rules

- Map Google Events to a readonly `PhoenixEvent` entity
- Map Google Event colors to the Phoenix CSS/Material color palette
- **Sanitize HTML descriptions** before rendering (XSS prevention)
- Events are read-only in Phoenix — no write-back to Calendar

---

## Google Drive & Docs Integration

### Drive Operations

| Operation | API Method | Details |
|-----------|-----------|---------|
| Search for docs | `files.list` | Use `q` param: `mimeType='application/vnd.google-apps.document'` |
| Create doc | `files.create` | Set MIME type to `application/vnd.google-apps.document` |
| Link doc to task | — | Store `webViewLink` and `iconLink` in task's Phoenix meta |
| Store habits | `files.create` / `files.update` | In `appDataFolder` — `habits.json` |
| Store notes | `files.create` / `files.update` | In `Phoenix_Notes` folder in user's Drive |

### App Data Folder

- Scope: `drive.appdata`
- Hidden from the user's Drive UI
- Used for: `habits.json`, app configuration
- The folder name `appDataFolder` is a special alias — not a real folder name

### Phoenix Notes Folder

- Scope: `drive.file` (only files created by the app are accessible)
- Create a `Phoenix_Notes` folder in the user's root Drive
- Each note is a JSON file in this folder

---

## Gmail API

### Key Endpoints

| Operation | Method | Endpoint | Notes |
|-----------|--------|----------|-------|
| List messages | GET | `/gmail/v1/users/me/messages` | `q=is:unread in:inbox`, `maxResults=10` |
| Get message | GET | `/gmail/v1/users/me/messages/{id}` | `format=metadata`, `metadataHeaders=From,Subject,Date`; includes `snippet` |
| Get profile | GET | `/gmail/v1/users/me/profile` | Returns `messagesTotal`, `threadsTotal` |

### Scope

- `gmail.readonly` — read-only access to messages, labels, threads
- Provides message snippets (unlike `gmail.metadata`)

### Usage Notes

- Batch message ID list + individual metadata fetches (no batch API needed for ≤10 messages)
- Parse `From`, `Subject`, `Date` from `payload.headers[]`
- `snippet` is a plain-text excerpt returned on the message resource
- Phoenix uses Gmail in read-only mode — no sending, composing, or modifying

---

## Calendar Write Operations

### Key Endpoints

| Operation | Method | Endpoint | Notes |
|-----------|--------|----------|-------|
| Create event | POST | `/calendar/v3/calendars/primary/events` | Returns created event with ID |
| Update event | PATCH | `/calendar/v3/calendars/primary/events/{eventId}` | Partial update |
| Delete event | DELETE | `/calendar/v3/calendars/primary/events/{eventId}` | Permanent delete |

### Create Event Body

```json
{
  "summary": "Task: Fix login bug",
  "start": { "dateTime": "2026-02-18T09:00:00Z" },
  "end": { "dateTime": "2026-02-18T10:00:00Z" },
  "colorId": "7",
  "description": "Time block for Phoenix task"
}
```

### Conference Data (Meet Links)

Calendar events may include conference/meet data:

```json
{
  "hangoutLink": "https://meet.google.com/abc-defg-hij",
  "conferenceData": {
    "entryPoints": [
      { "entryPointType": "video", "uri": "https://meet.google.com/abc-defg-hij" }
    ]
  }
}
```

Extract logic: prefer `conferenceData.entryPoints[type=video].uri`, fallback to `hangoutLink`.

---

## Quota & Rate Limiting

### Retry Strategy

Implement **exponential backoff with jitter** for all Google API calls:

```
On 429 Too Many Requests:
  wait = 2^attempt + random_jitter(0, 1000ms)
  max_attempts = 5
  retry after wait
```

### Implementation Rules

- Wrap ALL Google API HTTP calls in retry logic
- Web: Use RxJS `retryWhen` operator or interceptor-level retry
- Android: Use Kotlin Flow `retry` or OkHttp interceptor
- Log all 429s for observability
- Never retry 4xx errors other than 401 (token refresh) and 429 (rate limit)

---

## Agent Checklist

- [ ] OAuth PKCE flow implemented (no client secret)
- [ ] Incremental scopes — baseline scopes at login, feature scopes on demand
- [ ] AuthInterceptor handles 401 → refresh → redirect flow
- [ ] Google Tasks: pagination via `pageToken` loop
- [ ] Google Tasks: `moveTask` sends both `parent` and `previous`
- [ ] Calendar: sync token stored and reused; handle `410 Gone`
- [ ] Calendar events are read-only in Phoenix
- [ ] HTML in calendar event descriptions is sanitized
- [ ] Drive: `appDataFolder` alias used for habits/config
- [ ] Drive: `Phoenix_Notes` folder for note storage
- [ ] All API calls have 429 retry with exponential backoff + jitter
- [ ] Never retry non-retryable 4xx errors (except 401, 429)
