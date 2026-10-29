# Project structure

This inventory lists every source-owned directory in the repository. `docs/api-reference/` and `.valfuse/reports/` are generated and ignored by Git; dependency, build, Git, IDE, and browser-capture directories are excluded from the source tree and listed separately below.

## Directory responsibilities

| Directory | Responsibility |
| --- | --- |
| `.codex/rules` | Project-level engineering rules used by Codex. |
| `docs` | Architecture, API contract coverage, design-system, and generated API documentation guidance. |
| `locales/<module>` | Valfuse translation sources, with one locale JSON file per supported language. |
| `public` | Static files copied to the application output without bundler processing. |
| `src/app` | Application composition, routing, authenticated shell, page templates, and global styles. |
| `src/config` | Frontend configuration such as environment values and brand settings. |
| `src/infrastructure` | Technical adapters shared by modules, including HTTP transport. |
| `src/modules` | Business modules. Each module owns its domain, data, presentation, dependency wiring, and route definitions. |
| `src/shared/domain` | Domain-neutral result, pagination, and failure types. |
| `src/shared/presentation` | Reusable view state and UI primitives that do not depend on a business module. |
| `tests` | Cross-module, API contract, provider-scope, and UI-flow tests. |

## Localization

Valfuse source messages live in `locales/<module>/{id,en}.json`. The folder name must match each file's `@@module` metadata, and `@@locale` identifies the language. Generated runtime files live in `src/app/localization/generated/`; validation reports go to ignored `.valfuse/reports/`. Regenerate and validate with `npm run i18n:generate` and `npm run i18n:validate` instead of editing generated files by hand.

## Complete directory inventory

```text
.
├── .codex/
│   └── rules/
├── docs/
├── locales/
│   ├── account/
│   ├── app/
│   ├── auth/
│   ├── common/
│   ├── health/
│   ├── roles/
│   └── users/
├── public/
├── src/
│   ├── app/
│   │   ├── router/
│   │   ├── shell/
│   │   ├── styles/
│   │   │   └── tokens/
│   │   └── templates/
│   ├── config/
│   ├── infrastructure/
│   │   └── http/
│   ├── modules/
│   │   ├── account/
│   │   │   ├── data/
│   │   │   │   └── repositories/
│   │   │   ├── di/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   ├── repositories/
│   │   │   │   └── usecases/
│   │   │   ├── presentation/
│   │   │   │   ├── pages/
│   │   │   │   └── state/
│   │   │   └── router/
│   │   ├── auth/
│   │   │   ├── data/
│   │   │   │   ├── dto/
│   │   │   │   └── repositories/
│   │   │   ├── di/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   ├── failures/
│   │   │   │   ├── repositories/
│   │   │   │   └── usecases/
│   │   │   ├── presentation/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── login/
│   │   │   │   │   └── register/
│   │   │   │   │       └── state/
│   │   │   │   └── state/
│   │   │   │       └── session/
│   │   │   └── router/
│   │   ├── health/
│   │   │   ├── data/
│   │   │   │   └── repositories/
│   │   │   ├── di/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   ├── repositories/
│   │   │   │   └── usecases/
│   │   │   ├── presentation/
│   │   │   │   ├── pages/
│   │   │   │   └── state/
│   │   │   └── router/
│   │   ├── roles/
│   │   │   ├── data/
│   │   │   │   └── repositories/
│   │   │   ├── di/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   ├── repositories/
│   │   │   │   └── usecases/
│   │   │   ├── presentation/
│   │   │   │   ├── pages/
│   │   │   │   └── state/
│   │   │   └── router/
│   │   └── users/
│   │       ├── data/
│   │       │   ├── datasources/
│   │       │   ├── dto/
│   │       │   ├── mappers/
│   │       │   └── repositories/
│   │       ├── di/
│   │       ├── domain/
│   │       │   ├── entities/
│   │       │   ├── failures/
│   │       │   ├── repositories/
│   │       │   ├── usecases/
│   │       │   └── values/
│   │       ├── presentation/
│   │       │   ├── dialogs/
│   │       │   │   └── delete-user/
│   │       │   │       └── state/
│   │       │   ├── modals/
│   │       │   │   └── edit-user/
│   │       │   │       └── state/
│   │       │   ├── organisms/
│   │       │   └── pages/
│   │       │       ├── user-detail/
│   │       │       │   └── state/
│   │       │       └── user-list/
│   │       │           └── state/
│   │       └── router/
│   └── shared/
│       ├── domain/
│       └── presentation/
│           ├── state/
│           └── ui/
│               ├── atoms/
│               ├── molecules/
│               ├── organisms/
│               └── patterns/
└── tests/
```

## Layer conventions

- `domain` contains business types, repository contracts, failures, values, and use cases. It does not import React, Zustand, HTTP adapters, or UI code.
- `data` contains DTOs, remote data sources, mappers, and repository implementations. It depends on domain contracts and infrastructure.
- `presentation` owns pages, interaction state, and module-specific UI. It receives operations from its router or parent composition.
- `di` assembles a module's domain and data implementations.
- `router` exposes route paths and creates routes from dependencies supplied by `app/router`.
- `app` is the composition root. It connects modules through their `index.ts` public APIs and owns cross-module navigation decisions.
- `shared` contains domain-neutral types and presentation components. It does not import app or business modules.

## Directories excluded from the source inventory

`node_modules/`, `dist/`, `.git/`, and `docs/api-reference/` contain dependencies, build output, Git internals, or generated HTML. `.idea/`, `.playwright-mcp/`, and `.husky/_/` contain local IDE, browser-capture, or generated hook data. These directories are ignored or generated and are not application source layers.
