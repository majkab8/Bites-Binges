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

| Command             | Description                               |
| ------------------- | ----------------------------------------- |
| `pnpm dev`          | Start the development server              |
| `pnpm build`        | Create a production build                 |
| `pnpm start`        | Serve the production build                |
| `pnpm lint`         | Run ESLint                                |
| `pnpm typecheck`    | Type-check the project with TypeScript    |
| `pnpm format`       | Format all files with Prettier            |
| `pnpm format:check` | Check formatting without writing (for CI) |

## Project structure

```
src/
  app/        Routes, layouts and pages (App Router)
public/       Static assets served from /
```

Imports use the `@/` alias, which maps to `src/` (e.g.
`import x from "@/app/..."`).
