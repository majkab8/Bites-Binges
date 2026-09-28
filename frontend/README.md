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
  app/        Routes, layouts and pages (App Router)
public/       Static assets served from /
```

Imports use the `@/` alias, which maps to `src/` (e.g.
`import x from "@/app/..."`).
