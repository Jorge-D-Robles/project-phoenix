# Domain Models & Data Ontology

> Distilled from `design.md` §2. Refer to `design.md` for full context.

---

## Task Entity

The Task is the atomic unit of the system. It aggregates Google Tasks API fields with Phoenix-specific metadata.

### Schema

| Field | Type | Nullable | Source | Description |
|-------|------|----------|--------|-------------|
| `id` | String | No | Google | Unique ID from Google Tasks API |
| `localId` | String | No | Phoenix | UUID v4 for optimistic creations before sync |
| `title` | String | No | Google | User-facing task content |
| `status` | Enum | No | Google | `needsAction` or `completed` |
| `dueDateTime` | String | Yes | Google | RFC 3339 timestamp (Google often discards time, keeps date only) |
| `notes` | String | Yes | Google | Raw description. Contains Phoenix Meta Block at end |
| `meta` | Object | Yes | Phoenix | Parsed JSON: `{ habitId, docLinks, tags }` |
| `parent` | String | Yes | Google | Parent task ID (for subtasks) |
| `position` | String | No | Google | Lexicographic sort string among siblings |
| `updatedDateTime` | String | No | Google | Last server-side modification timestamp |
| `isDirty` | Boolean | No | Phoenix | Local modification not yet synced (Android only) |
| `isDeleted` | Boolean | No | Phoenix | Soft-delete flag for sync resolution (Android only) |

### Metadata Packing Strategy

Google Tasks does not support custom fields. Phoenix packs metadata into the `notes` field using a delimiter:

```
User's actual notes text here...

---PHOENIX_META---
{"habitId":"abc-123","docLinks":["https://..."],"tags":["work"]}
```

**Implementation rules:**
- Delimiter pattern: `\n---PHOENIX_META---\n`
- Implement a `TaskParser` that extracts the meta JSON from the notes field via regex
- Everything before the delimiter is user-visible notes
- Everything after is the JSON meta object
- When writing back, re-serialize and append the meta block
- If no meta exists, the delimiter is absent

---

## Habit Definition

Stored in `habits.json` in Google Drive Application Data Folder.

```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "title": { "type": "string", "minLength": 1 },
    "frequency": { "type": "string", "enum": ["DAILY", "WEEKLY", "MONTHLY"] },
    "targetValue": { "type": "integer", "minimum": 1, "description": "Goal count per period" },
    "color": { "type": "string", "pattern": "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" },
    "archived": { "type": "boolean", "default": false },
    "created": { "type": "string", "format": "date-time" },
    "lastModified": { "type": "string", "format": "date-time" }
  }
}
```

### Field Rules

- `id`: Generate UUID v4 on creation
- `title`: Non-empty string, required
- `frequency`: One of `DAILY`, `WEEKLY`, `MONTHLY` — no other values
- `targetValue`: Positive integer (>= 1)
- `color`: Valid hex color (`#RRGGBB` or `#RGB`)
- `archived`: Defaults to `false`; archived habits are hidden from the active view but retained for heatmap history
- `created` / `lastModified`: ISO 8601 UTC

---

## Habit Log

Records individual habit completions. Stored as a sparse array (only days with activity) to optimize heatmap rendering.

```json
{
  "type": "object",
  "properties": {
    "habitId": { "type": "string", "format": "uuid" },
    "date": { "type": "string", "format": "date", "description": "YYYY-MM-DD" },
    "value": { "type": "integer", "description": "Magnitude of the contribution" }
  }
}
```

### Field Rules

- `habitId`: Must reference a valid Habit Definition `id`
- `date`: `YYYY-MM-DD` format only (no time component)
- `value`: Non-negative integer representing contribution magnitude

---

## Phoenix Note

A Keep surrogate — JSON files stored in a `Phoenix_Notes` folder in Google Drive. The Google Keep API is not available for personal accounts, so Phoenix implements its own note format.

```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "description": "Google Drive File ID" },
    "title": { "type": "string" },
    "content": { "type": "string", "description": "HTML or Markdown content" },
    "labels": { "type": "array", "items": { "type": "string" } },
    "color": { "type": "string", "enum": ["DEFAULT", "RED", "ORANGE", "YELLOW", "GREEN", "TEAL", "BLUE", "PURPLE", "PINK", "BROWN", "GRAY"] },
    "attachments": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "fileId": { "type": "string" },
          "mimeType": { "type": "string" },
          "webViewLink": { "type": "string" }
        }
      }
    }
  }
}
```

### Field Rules

- `id`: Assigned by Google Drive on file creation — do not generate locally
- `title`: Can be empty string (untitled note)
- `content`: HTML or Markdown — sanitize before rendering to prevent XSS
- `color`: Must be one of the 11 enum values above
- `attachments[].fileId`: Must reference a valid Drive file

---

## Agent Checklist

- [ ] All date-time fields normalized to ISO 8601 UTC before persistence or transmission
- [ ] Local IDs are UUID v4
- [ ] Nullable fields handled explicitly — never use `any` or `Object`
- [ ] TaskParser implements regex extraction of `\n---PHOENIX_META---\n{...json...}`
- [ ] Habit logs are sparse arrays (no zero-value entries)
- [ ] Phoenix Notes content is sanitized before rendering (XSS prevention)
- [ ] When generating TypeScript interfaces or Kotlin data classes, mark optional fields with `?` / `Nullable`
