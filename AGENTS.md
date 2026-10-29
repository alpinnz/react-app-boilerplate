# Repository Guidelines

## Project Structure & Modules

This repository is a Vite single-page application built with React 19, TypeScript, React Router, and Zustand.

- `src/main.tsx` starts the app; `src/App.tsx` wires providers and dependencies.
- `src/app/` owns routing, shell, templates, localization, and global styles. Design tokens are in `src/app/styles/tokens/`.
- `src/modules/{account,auth,health,roles,users}/` contains feature code. Keep domain rules framework-free; data adapters implement domain contracts; presentation receives operations through props; app routing composes module public APIs.
- `src/infrastructure/http/` contains shared transport adapters. `src/shared/domain/` and `src/shared/presentation/` hold business-neutral types and UI.
- `locales/<module>/{id,en}.json` contains Valfuse messages grouped by module; `public/` contains static files; `tests/` contains cross-module and UI tests. See `docs/project-structure.md` and `docs/design-system.md` for details.

## Build, Test & Development

- `npm run dev` starts the Vite development server.
- `npm run build` runs TypeScript project checks and creates the production bundle.
- `npm run lint` runs ESLint; `npm run test` runs Vitest once.
- After changing locale files, run `npm run i18n:generate` and `npm run i18n:validate`.

## Style, Architecture & Testing

Use two-space indentation, single quotes, and omit semicolons, matching existing TypeScript. Name React components and files in PascalCase, hooks with the `use` prefix, and tests `*.test.ts` or `*.test.tsx`. Keep module dependencies flowing inward: modules must not import other modules directly, shared UI must not import app or feature modules, and app code should use module `index.ts` exports. Use semantic design tokens instead of raw palette values. Vitest and Testing Library are used for unit and UI tests; add focused regression coverage for behavior changes. Consult `.codex/rules/frontend.md`, `architecture.md`, and `testing.md` for detailed guidance.

## Commits, Pull Requests & Configuration

Git history currently has only an initial commit, so it establishes no commit convention. Use Conventional Commits, for example `fix(auth): preserve remembered sessions`. Pull requests should explain the behavior changed, list verification commands and results, and include screenshots for visual changes. Configure local API access through `VITE_API_BASE_URL` using `.env.example`; never commit credentials. Do not edit generated files under `src/app/localization/generated/` by hand.
