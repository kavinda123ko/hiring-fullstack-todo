# Full-Stack Todo App

A production-quality todo application built as a hiring assignment — React frontend, Express backend, MongoDB database, in an npm workspaces monorepo.

## Features

- **CRUD** — create, read, update, and delete todos with a title and optional description
- **Toggle completion** — pending and completed sections with instant visual feedback
- **Optimistic UI** — every mutation reflects in the UI immediately; rolls back silently on server error
- **Form validation** — client-side checks with character counters; server-side Mongoose schema validation
- **User-friendly errors** — toast notifications for API failures, animated inline errors for form issues
- **Animations** — items animate in/out, list reorders with layout transitions, modal scales in with backdrop blur
- **Delete confirmation** — two-step confirm prevents accidental deletes
- **Completion progress bar** — animated bar tracks how many todos are done
- **Zero-config database** — embedded MongoDB for local dev; swap in Atlas URI for production

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 + Vite | Fast HMR, modern hooks-first React |
| Server state | TanStack Query v5 | Optimistic updates, cache invalidation, deduplication |
| Styling | Tailwind CSS v3 | Utility-first, no CSS files to maintain |
| Animations | Framer Motion | Declarative layout transitions, AnimatePresence for exit |
| API client | Axios | Consistent error shape via `response.data.error` |
| Notifications | react-hot-toast | Non-intrusive, auto-dismissing toasts |
| Backend | Express 4 | Minimal, widely understood REST framework |
| ODM | Mongoose 8 | Schema validation, `timestamps`, clean query helpers |
| Database | MongoDB | Flexible documents; easy to extend the Todo schema |
| Monorepo | npm workspaces | Native Node.js, zero extra tooling, shared `node_modules` |
| Dev runner | concurrently | Single `npm run dev` starts both services with colour-coded output |

## Project Structure

```
hiring-fullstack-todo/
├── package.json              # Workspace root — scripts + concurrently
├── client/                   # React SPA (port 5173)
│   ├── src/
│   │   ├── api/todos.js      # Thin Axios wrapper — one function per endpoint
│   │   ├── components/
│   │   │   ├── TodoForm.jsx  # Inline create form with expanding description
│   │   │   ├── TodoList.jsx  # Splits todos into pending / completed sections
│   │   │   ├── TodoItem.jsx  # Single row — toggle, edit, two-step delete
│   │   │   └── EditModal.jsx # Animated modal with pre-filled fields
│   │   └── App.jsx           # All TanStack Query mutations + optimistic logic
│   └── vite.config.js        # /api → localhost:5000 proxy
└── server/                   # Express REST API (port 5000)
    ├── src/
    │   ├── models/Todo.js    # Mongoose schema with field-level validation
    │   ├── routes/todos.js   # Five REST handlers
    │   └── index.js          # MongoDB connect → app.listen
    └── .env.example          # Documented environment variables
```

## Quick Start

### Prerequisites

- **Node.js 18+**
- No database installation needed — the server embeds MongoDB automatically

### 1. Install all dependencies

```bash
npm install
```

This installs dependencies for both workspaces in one command.

### 2. Start both services

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api/todos |

The server starts an embedded MongoDB instance on first run. Data is persisted to `server/.mongodb-data/` so it survives restarts.

### Optional: use your own MongoDB

```bash
cp server/.env.example server/.env
# Set MONGODB_URI to a local or Atlas connection string
```

### Run services individually

```bash
npm run client   # frontend only
npm run server   # backend only
```

## API Reference

See [server/README.md](server/README.md) for full endpoint documentation.

## Design Decisions

**Optimistic updates everywhere.** All four mutations (create, update, toggle, delete) use TanStack Query's `onMutate` snapshot-and-rollback pattern. The cache is updated before the request leaves the browser; if the server returns an error the previous state is restored and a toast explains what went wrong.

**Embedded MongoDB for zero-config dev.** `mongodb-memory-server` with the `wiredTiger` engine and a fixed `dbPath` means contributors can `git clone && npm install && npm run dev` without installing MongoDB. Data persists across restarts because WiredTiger writes to disk.

**Dual-layer validation.** The client validates before sending (empty title, character limits) to give instant feedback. The server validates independently via Mongoose so the API is correct regardless of which client calls it.

**Edit only for pending todos.** Completed todos are treated as archived. Editing them would require unchecking first — this keeps the intent of the UI unambiguous.

**No authentication.** Out of scope for this assignment. Todos are global. Adding auth would mean a `userId` field on the schema and a middleware on each route.
