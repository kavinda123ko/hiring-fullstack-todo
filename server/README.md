# Todo App — Backend

Express 4 REST API backed by MongoDB/Mongoose. Zero-config local dev via embedded MongoDB; production-ready with any MongoDB URI.

## Setup

```bash
cp .env.example .env   # optional — only needed to override defaults
npm install
npm run dev
```

Server starts on **http://localhost:5000**.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | HTTP port |
| `MONGODB_URI` | *(none)* | MongoDB connection string. If unset, an embedded MongoDB instance is used and data is persisted to `../.mongodb-data/`. |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin |

### MongoDB options

**Embedded (default, zero-config):** Leave `MONGODB_URI` unset. The server starts `mongodb-memory-server` with the `wiredTiger` engine and a persistent path — no installation needed, data survives restarts.

**Local:** Install [MongoDB Community](https://www.mongodb.com/try/download/community) and set `MONGODB_URI=mongodb://localhost:27017/todos`.

**Atlas:** Create a free cluster, whitelist your IP, and set `MONGODB_URI` to the connection string from the Atlas dashboard.

## API Endpoints

| Method | Endpoint | Body | Response | Description |
|--------|----------|------|----------|-------------|
| `GET` | `/api/todos` | — | `Todo[]` (newest first) | List all todos |
| `POST` | `/api/todos` | `{ title, description? }` | `Todo` | Create a todo |
| `PUT` | `/api/todos/:id` | `{ title, description? }` | `Todo` | Update title / description |
| `PATCH` | `/api/todos/:id/done` | — | `Todo` | Toggle done status |
| `DELETE` | `/api/todos/:id` | — | `{ message, id }` | Delete a todo |

All error responses use the shape `{ "error": "message" }`.

## Data Model

```json
{
  "_id":         "string (ObjectId)",
  "title":       "string — required, max 200 chars",
  "description": "string — optional, max 1000 chars, default ''",
  "done":        "boolean — default false",
  "createdAt":   "ISO 8601 timestamp",
  "updatedAt":   "ISO 8601 timestamp"
}
```

## Validation

Validation happens at two levels:

1. **Route handler** — rejects missing/blank `title` with `400` before touching the database.
2. **Mongoose schema** — enforces `required`, `maxlength`, and type constraints. Validation errors are caught and returned as `400` with a readable message.

## Project Structure

```
server/
├── src/
│   ├── index.js          # Bootstrap: env, Express, MongoDB, listen
│   ├── models/
│   │   └── Todo.js       # Mongoose schema + model
│   └── routes/
│       └── todos.js      # All five REST handlers
├── .env.example          # Documented defaults
└── package.json
```
