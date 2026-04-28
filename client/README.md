# Todo App — Frontend

React 18 SPA built with Vite. API calls to `/api/*` are proxied to the Express backend at `http://localhost:5000`.

## Setup

```bash
npm install
npm run dev
```

Runs on **http://localhost:5173**. The backend must also be running (see [../server/README.md](../server/README.md)).

## Key Libraries

| Library | Purpose |
|---------|---------|
| [TanStack Query v5](https://tanstack.com/query) | Server state, cache, optimistic updates |
| [Tailwind CSS v3](https://tailwindcss.com) | Utility-first styling |
| [Framer Motion](https://www.framer.com/motion/) | List animations, modal transitions, layout reorder |
| [react-hot-toast](https://react-hot-toast.com) | Success / error notifications |
| [Axios](https://axios-http.com) | HTTP client with consistent error shape |

## Features

| Feature | Details |
|---------|---------|
| Create todo | Inline form; description field expands on focus |
| Edit todo | Animated modal, pre-filled, Esc to close |
| Toggle done | Click the circle; item moves to Completed section |
| Delete todo | Two-step confirmation to prevent accidents |
| Optimistic updates | UI reflects changes instantly; rolls back on server error |
| Form validation | Client-side checks with animated character counters |
| Progress bar | Animated completion bar in the header |
| Error feedback | Toast for API errors, animated inline message for form errors |
| Animations | Items animate in/out; list reorders with layout transitions |

## Architecture

All server state lives in TanStack Query's cache under the `['todos']` key.

Every mutation in `App.jsx` follows the same pattern:

```
onMutate  → cancel in-flight queries → snapshot cache → apply optimistic update
onError   → restore snapshot → show error toast
onSuccess → invalidate cache → show success toast
```

Components are **presentational** — they receive data and callbacks as props and never call the API directly. The entire mutation + cache logic is colocated in `App.jsx` to make the data flow easy to follow.

## Component Map

```
App.jsx                 ← all mutations, query, optimistic logic
├── TodoForm.jsx        ← controlled form, char counters, inline validation
├── TodoList.jsx        ← splits pending / done, AnimatePresence for exit
│   └── TodoItem.jsx   ← toggle, edit button, two-step delete confirm
└── EditModal.jsx       ← animated modal, same validation as TodoForm
```

## Assumptions & Limitations

- No authentication — todos are global.
- No pagination — all todos are fetched in a single request. Fine for typical usage; cursor-based pagination would be needed at scale.
- Edit is only available for pending todos (not done) to keep UI intent clear.
