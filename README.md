# Messaging App

A real-time messaging application built with React, GraphQL, and PostgreSQL.

## How to Run

### Prerequisites

- Node.js (v18+)
- PostgreSQL running locally
- npm

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the database

Create a PostgreSQL database and configure the connection string in `server/.env`:

```env
DATABASE_URL="postgresql://<user>@localhost:5432/messaging_app?schema=public"
JWT_SECRET="dev-secret-change-me"
```

Run migrations and seed the database:

```bash
npm run db:migrate
npm run db:seed
```

This creates four test users: **alice**, **bob**, **charlie**, **diana** — all with password `password123`.

### 3. Start the app

```bash
npm run dev
```

This starts both the server (port 4000) and client (port 5173) concurrently.

- Frontend: http://localhost:5173
- GraphQL API: http://localhost:4000/graphql

## Architecture Overview

```
messaging-app/
├── server/                 # Node.js + Apollo Server + Prisma
│   ├── prisma/             # Schema, migrations, seed
│   ├── src/
│   │   ├── schema/
│   │   │   ├── typeDefs.ts       # GraphQL type definitions
│   │   │   └── resolvers/        # Auth, thread, message resolvers
│   │   ├── services/             # Business logic (auth, thread, message)
│   │   ├── context.ts            # JWT verification, request context
│   │   └── index.ts              # Server entry point (HTTP + WebSocket)
│   └── ...
├── client/                 # React + Vite + Apollo Client
│   ├── src/
│   │   ├── pages/                # LoginPage, MessagingPage
│   │   ├── components/           # ThreadList, ChatView, MessageBubble, etc.
│   │   ├── graphql/operations.ts # All queries, mutations, subscriptions + types
│   │   ├── apollo.ts             # Apollo Client setup (HTTP + WS split link)
│   │   └── hooks/useAuth.ts      # Auth context
│   └── ...
└── package.json            # npm workspaces root
```

## Design Decisions

### Why GraphQL over gRPC and tRPC

A key requirement was E2E type-safety between client and server. The main options were gRPC, tRPC, and GraphQL — the decision came down to which fits a browser-based real-time messaging app best:

- **gRPC** — designed for service-to-service communication using Protocol Buffers (binary serialization). Great for backend microservices, but awkward for browser clients. gRPC-Web exists but requires a proxy layer, and real-time support relies on server-side streaming which has limited browser support. Overkill for a browser-to-server web app.
- **tRPC** — excellent DX and zero-schema type-safety when both sides are TypeScript. However, its real-time subscription support is less mature than GraphQL's, and it lacks an equivalent to Apollo's normalized cache — which is important for a chat app where incoming messages need to be surgically inserted into the right thread's message list without refetching. It's also tightly coupled to the TypeScript ecosystem with no language-agnostic schema contract.
- **GraphQL** — language-agnostic schema that acts as a shared contract, first-class subscription support via `graphql-ws`, and Apollo Client's normalized cache makes real-time cache updates straightforward. The client queries exactly the fields it needs (no over-fetching), and queries, mutations, and subscriptions are unified under one schema.

GraphQL was the best fit given the real-time requirement and the need for fine-grained cache control on the client.

### Why Apollo (Server + Client)

Apollo is the most mature GraphQL ecosystem for Node.js + React. Apollo Server integrates cleanly with Express and supports subscriptions via `graphql-ws`. Apollo Client's normalized cache is critical for this app — when a new message arrives via subscription, I write directly to the cache with `writeQuery` and the UI updates reactively without refetching.

An alternative would be GraphQL Yoga + urql, but Apollo's cache normalization and `writeQuery` API are better suited for chat apps where I need to surgically update thread message lists and reorder the thread sidebar in response to incoming messages.

### Why Prisma

Prisma provides type-safe database access that maps well to the GraphQL schema. The generated client gives auto-complete and compile-time checks for all queries. Migrations are version-controlled and the seed script makes onboarding trivial.

For a project using PostgreSQL, Prisma hits the sweet spot between raw SQL (too verbose) and heavier ORMs like TypeORM (more ceremony, less type-safety).

### Why a monorepo with npm workspaces

The project is small enough that a monorepo keeps things simple — one `npm install`, one repo, shared `graphql` dependency. npm workspaces (vs. Turborepo, Nx) avoids adding build orchestration complexity for a two-package project.

### Real-time architecture

The app uses two subscription channels:

1. **`messageSent(threadId)`** — per-thread, for clients actively viewing a specific conversation.
2. **`messageReceived`** — per-user, scoped to the authenticated user. When any message is sent, all participants receive it on their user channel.

The client uses a single `messageReceived` subscription at the `MessagingPage` level (not per-thread). This is more efficient than subscribing/unsubscribing per thread and ensures the thread list stays updated even for conversations not currently open.

The `sendMessage` mutation uses Apollo's `update` callback to optimistically update the cache for the sender, so their own message appears instantly without waiting for the subscription round-trip.

**Scaling limitation**: The current implementation uses in-memory `PubSub`, which doesn't work across multiple server instances. In production, subscriptions would be backed by Redis PubSub or Kafka, and WebSocket connections would require sticky sessions or a shared event bus.

### Data model

The schema uses a join table (`ThreadParticipant`) between `Thread` and `User` rather than a direct many-to-many. This supports DMs today and extends to group chats without schema changes — just allow more than two participants. The `@@unique([threadId, userId])` constraint prevents duplicate membership, and `@@index([userId])` ensures fast thread lookups per user.

Messages are indexed on `[threadId, createdAt]` for efficient chronological retrieval within a thread.

### Authentication

JWT-based authentication. The login mutation validates credentials with bcrypt and returns a token. The token is sent via the `Authorization` header (set by Apollo's `setContext` auth link) for HTTP requests and via `connectionParams` for WebSocket subscriptions. The server extracts and verifies the token in the GraphQL context for both transports.

Tokens are stored in `localStorage`. This is acceptable for a demo; a production app would use HTTP-only cookies to mitigate XSS. Tokens are short-lived and would be paired with refresh tokens in production.

## Tradeoffs

For the initial version, I prioritized:

- **Complete feature coverage** — login, thread creation, messaging, and real-time all work end-to-end.
- **Clean separation of concerns** — resolvers delegate to services, business logic is not in the GraphQL layer.
- **Correct real-time behavior** — messages appear instantly for both sender and receiver without polling or page refreshes.
- **Schema extensibility** — the data model supports group chats without migration changes.

Over:

- Comprehensive test coverage (no automated tests).
- Pagination (message lists are unbounded).
- Production security hardening (JWT in localStorage, no rate limiting).
- Horizontal scalability infrastructure (in-memory PubSub).

The goal was a maintainable, extensible foundation — not a prematurely optimized system.

## Performance Considerations

- Messages are indexed on `[threadId, createdAt]` for efficient chronological retrieval within a thread.
- Thread lookups are indexed on `userId` via the `ThreadParticipant` join table.
- The `GET_THREADS` query fetches only `lastMessage` (not all messages), avoiding N+1-style over-fetching on the thread list.
- Apollo Client's normalized cache avoids unnecessary network requests — subscription data and mutation responses are written directly to cache.
- Prisma relations and careful resolver design avoid N+1 issues. If this system evolved, DataLoader would be introduced for batching user lookups.
- Message lists are currently unpaginated. In production, this would use cursor-based pagination (`createdAt` cursor + `limit`) to avoid loading entire conversation histories.

## Failure and Edge Cases

- **Unauthorized thread access**: The server validates that the authenticated user is a participant before returning thread data.
- **Duplicate threads**: A unique constraint on `[threadId, userId]` in `ThreadParticipant` prevents creating duplicate conversations between the same two users. The service layer checks for existing threads before creating.
- **Subscription authentication**: WebSocket connections validate the JWT during the connection handshake (`connectionParams`), not just on individual messages.
- **Corrupted local storage**: The client wraps `JSON.parse(localStorage.getItem("user"))` in a try/catch — corrupted data clears the session gracefully instead of crashing the app.
- **Expired/invalid JWTs**: The server returns a clear GraphQL error, and the client can handle logout accordingly.

## Future Improvements

- **Pagination**: Messages and threads are currently unbounded. Would add cursor-based pagination for messages (`before`/`after` + `limit`) and offset pagination for threads.
- **Typing indicators**: A lightweight subscription (`userTyping(threadId)`) with debouncing.
- **Message delivery status**: Sent/delivered/read receipts using a `readAt` timestamp per participant per message.
- **Group chats**: The schema already supports it. Would need UI changes for participant selection and thread naming.
- **E2E and integration tests**: API tests with a test database, component tests with React Testing Library.
- **Rate limiting**: Prevent message spam via a resolver-level rate limiter.
- **Error boundaries**: React error boundaries around the subscription and chat components.
- **Connection state UI**: Show the user when the WebSocket connection drops and auto-reconnect.
