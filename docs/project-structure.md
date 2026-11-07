# Project structure

This Vite SPA is a React application starter. The bundled account, auth, health, roles, and users modules are examples that can be replaced or removed for a new product.

## Directory responsibilities

| Path | Responsibility |
| --- | --- |
| `src/App.tsx` | Composition root for providers, shared HTTP, module dependencies, and the application router. |
| `src/app` | Application routing, shell adapters, templates, localization setup, global styles, and design tokens. |
| `src/config` | Brand defaults and frontend environment configuration. |
| `src/infrastructure/http` | Shared fetch transport, authorization, timeouts, and transport error mapping. |
| `src/modules/<module>` | Feature-owned domain, data adapters, presentation, dependency wiring, and route definitions. |
| `src/shared/domain` | Domain-neutral result, pagination, and operation failure types. |
| `src/shared/presentation` | Reusable view state, localized error mapping, and UI components. |
| `locales/<module>` | Valfuse translation source files, one JSON file per supported locale. |
| `tests` | HTTP contract, provider-scope, module-state, and UI flow tests. |
| `docs` | API assumptions, design system, and repository guidance. |

## Module boundaries

- `domain` owns business types, repository contracts, failures, values, and use cases. It does not depend on React, Zustand, HTTP adapters, or presentation.
- `data` implements domain contracts and uses infrastructure at the boundary. Put untrusted response validation in `data/dto`, then convert validated DTOs into domain entities or repository result types in `data/mappers`; repositories orchestrate transport, parsing, mapping, and failure conversion.
- `presentation` owns pages and interaction state. It receives operations from the module router or parent composition.
- `di` assembles a module's domain and data implementations; `router` exposes paths and creates routes from supplied operations.
- `src/app` integrates modules through their `index.ts` public APIs. A feature module must not import another feature module directly.
- `src/shared` remains independent of app code and business modules.

## Localization

Keep messages in `locales/<module>/{id,en}.json`. The directory name must match `@@module`; `@@locale` must match the language code. Run `pnpm run i18n:generate` after changing source messages, then run `pnpm run i18n:validate`. Do not edit `src/app/localization/generated/` by hand.

## Generated output

TypeDoc HTML is generated under `docs/api-reference/`; Valfuse reports are written under `.valfuse/reports/`. Both are generated output and ignored by Git. The backend implementation is not included; the provided OpenAPI contract is summarized in `docs/api-coverage.md` and exercised against a local mock server in the API tests.
