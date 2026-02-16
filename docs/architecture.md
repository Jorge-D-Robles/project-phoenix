# Architecture — System Philosophy & Tech Stack

> Distilled from `design.md` §1. Refer to `design.md` for full context.

---

## System Philosophy

Project Phoenix is a **Client-Centric Aggregator**. There is no proprietary backend. Both clients (Web and Android) connect directly to Google Workspace APIs.

### Core Principles

- **Thick Client**: The browser/device is the orchestration engine — not a relay to a backend
- **Local Source of Truth**: Each client maintains local state, optimistically synced with Google's servers (the Remote Source of Truth)
- **Data Sovereignty**: User data lives on-device or in their Google account — never on Phoenix infrastructure
- **Offline-First**: Both platforms must function without network access; sync happens opportunistically

### What This Means for Implementation

- No backend services to build, deploy, or maintain
- All sync complexity lives in the client
- Google Drive Application Data Folder acts as a pseudo-backend for habits and config
- Conflict resolution must be handled client-side (Server Wins for MVP)

---

## Tech Stack

| Concern | Web | Android |
|---------|-----|---------|
| **Framework** | Angular 21+ (Signals, no zone.js) | Kotlin + Jetpack Compose |
| **State Management** | SignalStore (`@ngrx/signals`) | StateFlow in ViewModels |
| **Build System** | esbuild (via Angular CLI) | Gradle + AGP |
| **Local Persistence** | — (in-memory/SignalStore) | Room (SQLite) |
| **HTTP Client** | Angular HttpClient | Retrofit + OkHttp |
| **DI** | Angular built-in | Hilt / Dagger |
| **Background Sync** | — (online-only for MVP) | WorkManager |
| **Auth** | OAuth 2.0 PKCE (angular-oauth2-oidc or similar) | OAuth 2.0 PKCE (Google Identity Services) |

---

## Agentic Design Principles

This system is designed for **agent-first** implementation:

1. **Semantic Data Models** — JSON schemas define the exact shape of every entity (see `domain-models.md`)
2. **Deterministic State Transitions** — Explicit Loading → Success / Error state machines
3. **Transposition Mapping** — Angular ↔ Compose concept dictionary (see `android-spec.md`)

---

## Cross-Platform Data Flow

```
┌─────────────────────────────────────────────────────┐
│                    Google Cloud                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │  Tasks   │  │ Calendar │  │ Drive (appdata)  │   │
│  │   API    │  │   API    │  │ + Phoenix_Notes  │   │
│  └────▲─────┘  └────▲─────┘  └───────▲──────────┘   │
└───────┼──────────────┼────────────────┼──────────────┘
        │              │                │
   OAuth 2.0 PKCE  OAuth 2.0 PKCE  OAuth 2.0 PKCE
        │              │                │
┌───────┼──────────────┼────────────────┼──────────────┐
│       ▼              ▼                ▼              │
│  ┌─────────────────────────────────────────────┐    │
│  │           Client (Web or Android)            │    │
│  │                                              │    │
│  │  Auth → API Clients → Local Store → UI       │    │
│  └─────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

### Data Flow Summary

1. User authenticates via OAuth 2.0 PKCE (incremental scopes)
2. Client fetches data from Google APIs
3. Client normalizes API responses into Phoenix domain models
4. Local store (SignalStore / Room) serves as the UI's source of truth
5. Mutations are applied optimistically to local state, then synced to Google

---

## Agent Checklist

- [ ] Understand that there is NO backend — all logic is client-side
- [ ] Use incremental OAuth scopes (don't request all scopes at login)
- [ ] Implement optimistic updates with sync-back to Google
- [ ] Reference `design.md` §1 for additional architectural rationale
