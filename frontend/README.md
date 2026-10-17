# Bites & Binges — Frontend

Next.js (App Router) + React + TypeScript + Tailwind CSS, with React Compiler
enabled.

## Requirements

- Node.js 24+. The version is pinned in `.nvmrc`; with nvm or fnm run `nvm use`
  / `fnm use` in this folder.
- pnpm 12+. It is the only allowed package manager, and installs with npm, yarn
  or bun fail. The exact version is pinned in `package.json` (`packageManager`),
  and pnpm switches to it automatically.

Install pnpm if you don't have it:

```bash
npm install -g pnpm
```

## Getting started

```bash
pnpm install
pnpm dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Backend API

The dev server forwards every `/api/*` request to the Django backend (see
`rewrites` in `next.config.ts`), so the browser only talks to `localhost:3000`
and the session and CSRF cookies work without CORS. Start the backend first (see
`backend/README.md`).

Write API paths without a trailing slash, e.g. `/api/auth/login`. The proxy adds
the slash that Django expects.

`pnpm dev` uses `http://localhost:8000` unless `BACKEND_URL` is set.
`pnpm build` requires `BACKEND_URL` and fails without it, because the address is
fixed into the build and cannot be changed when the app starts.

Call the API through `request()` from `src/lib/api/client.ts`, or the helpers
built on it such as `src/features/auth/api.ts`. `request()` adds the
`X-CSRFToken` header to `POST` requests and turns error responses into an
`ApiError` with messages per field.

## Scripts

| Command              | Description                                     |
| -------------------- | ----------------------------------------------- |
| `pnpm dev`           | Start the development server                    |
| `pnpm build`         | Create a production build                       |
| `pnpm start`         | Serve the production build                      |
| `pnpm lint`          | Run ESLint                                      |
| `pnpm typecheck`     | Type-check the project with TypeScript          |
| `pnpm format`        | Format all files with Prettier                  |
| `pnpm format:check`  | Check formatting without writing (for CI)       |
| `pnpm test`          | Run unit and component tests once               |
| `pnpm test:watch`    | Run tests in watch mode                         |
| `pnpm test:coverage` | Run tests with a coverage report in `coverage/` |

## Testing

Unit and component tests use [Vitest](https://vitest.dev) and
[React Testing Library](https://testing-library.com/docs/react-testing-library/intro).
Put test files next to the code they test, named `*.test.ts` or `*.test.tsx`
inside `src/`.

- Unit tests: import a function and assert on its result.
- Component tests: `render()` the component, interact with it via
  `@testing-library/user-event`, and query it the way a user would
  (`screen.getByRole`, `getByText`, …).

Vitest can't render async Server Components. Move their logic into plain
functions and unit-test those; full pages will be covered by end-to-end tests.

## Project structure

```
src/
  app/              Routing only: pages, layouts and metadata (App Router)
    (auth)/         Sign-in and sign-up pages, wrapped in the form card layout
    (platform)/     Pages for logged-in users; the layout checks the session
  features/         Code for one area of the app
    auth/           Auth API calls, types, forms, session and logout
    dashboard/      Dashboard components
  components/ui/    Shared building blocks with no business logic
  lib/api/          HTTP client: requests, CSRF and error handling
public/             Static assets served from /
```

Rules:

- Keep pages in `app/` thin. They set the URL and metadata and put components
  from `features/` together. Logic lives in `features/`.
- Each file does one thing and is named after it, e.g. `sign-in-form.tsx`,
  `use-auth-form.ts`. Tests sit next to the file they test.
- Folders in brackets, such as `(auth)`, group routes under a shared layout and
  do not appear in the URL.
- A new page for logged-in users goes under `app/(platform)/`, so it gets the
  session check from its layout. A new Momo app gets
  `app/(platform)/app/<name>/` for its routes and `features/<name>/` for its
  code.
- A component used by one feature stays in that feature. Move it to
  `components/ui/` only when another feature needs it and it has no business
  logic.

Imports use the `@/` alias, which maps to `src/` (e.g.
`import { Button } from "@/components/ui/button"`).
