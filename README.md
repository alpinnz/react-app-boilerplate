# React + TypeScript + Vite Boilerplate

A modern, scalable, and modular React boilerplate built with **Vite**, **TypeScript**, **TailwindCSS**, and **Zustand**.
Designed for developers who prefer **feature-based architecture** and lightweight state management per page or module.

---

## Tech Stack

| Layer            | Library / Tool                                                      | Description                                     |
| ---------------- | ------------------------------------------------------------------- | ----------------------------------------------- |
| Framework        | [React 18+](https://react.dev/)                                     | Modern component-based UI library               |
| Build Tool       | [Vite 6+](https://vitejs.dev/)                                      | Fast development server and lightweight bundler |
| Language         | [TypeScript](https://www.typescriptlang.org/)                       | Static typing and better developer experience   |
| Styling          | [Tailwind CSS](https://tailwindcss.com/)                            | Utility-first CSS framework                     |
| Compiler         | [SWC](https://swc.rs/)                                              | High-speed Rust-based transpiler                |
| State Management | [Zustand](https://zustand-demo.pmnd.rs/)                            | Lightweight and modular global store            |
| Testing          | [Vitest](https://vitest.dev/) + [RTL](https://testing-library.com/) | Unit testing setup for React components         |
| Animation        | [Framer Motion](https://www.framer.com/motion/) _(optional)_        | Declarative motion and animation library        |

---

## Feature Overview

| Category             | Feature                  | Description                                                              | Status | Key Config / Params                              |
| -------------------- | ------------------------ | ------------------------------------------------------------------------ | ------ | ------------------------------------------------ |
| **Core**             | Project Configuration    | Ready setup: Vite, TypeScript, Tailwind, ESLint, Prettier, SWC           | ⏳     | `vite.config.ts`, `tsconfig.json`                |
|                      | Environment Variables    | `.env` and `.env.local` support for runtime configuration                | ⏳     | `VITE_API_URL`, `VITE_APP_NAME`, `VITE_ENV`      |
| **Architecture**     | Feature-Based Modules    | Each feature (e.g. Auth, Dashboard) has isolated logic, store, and pages | ⏳     | `src/features/*`                                 |
| **State Management** | Zustand per Feature      | Localized store per page/module instead of one large global store        | ⏳     | `storePath`, `persist`, `devtools`               |
| **Data Layer**       | API Service Layer        | Simple fetch/axios abstraction with token and error handling             | ⏳     | `baseUrl`, `timeout`, `tokenKey`                 |
| **Authentication**   | Auth System              | Basic auth flow (login/register/logout, token storage)                   | ⏳     | `authMethod`, `storageKey`                       |
|                      | Role-Based Access (RBAC) | Optional route guards based on roles or permissions                      | ⏳     | `roles[]`, `protectedRoutes`                     |
| **UI / Theming**     | UI Components Library    | Reusable and composable UI elements (Button, Modal, Input, etc.)         | ⏳     | `variant`, `size`, `color`                       |
|                      | Layout System            | Layout templates for dashboard, auth, or landing pages                   | ⏳     | `layoutType`, `containerWidth`, `navbarPosition` |
|                      | Dark Mode Toggle         | Switch between light and dark themes with persistence                    | ⏳     | `defaultTheme`, `themeStorageKey`                |
| **Localization**     | Multi-language (i18n)    | Multi-language support with i18next or custom context                    | ⏳     | `defaultLang`, `languages[]`                     |
| **Developer Tools**  | Absolute Imports         | Use `@/` alias for cleaner imports                                       | ⏳     | `vite.config.ts`                                 |
|                      | Linting & Formatting     | ESLint + Prettier configuration for consistent code style                | ⏳     | `.eslintrc`, `.prettierrc`                       |
|                      | Git Hooks                | Pre-commit validation using Husky + lint-staged                          | ⏳     | `husky.config.js`                                |
| **Testing**          | Unit Testing             | Vitest + React Testing Library setup for isolated testing                | ⏳     | `testPath`, `coverageThreshold`                  |
| **Optimization**     | Build Optimization       | SWC transpilation, code splitting, and asset compression                 | ⏳     | `swc`, `minify`, `chunkSplit`                    |
| **CI/CD**            | Deployment Pipeline      | Ready for GitHub Actions, Vercel, or Netlify deployment                  | ⏳     | `env`, `branch`, `deployScript`                  |

---

## Project Architecture

```
react-ts-vite-boilerplate/
├── .husky/                     # Husky Git hooks
│   ├── _/                      # Husky internal helper scripts
│   └── pre-commit              # Hook to run lint-staged before commit
│
├── src/
│   ├── core/                   # Root app, router, and layout structure
│   │   ├── router/             # Application routing configuration
│   │   ├── providers/          # App-wide providers (theme, i18n, etc.)
│   │   └── layout/             # Global layout templates
│   │
│   ├── features/               # Feature-based modules (auth, dashboard, etc.)
│   │   ├── auth/
│   │   │   ├── pages/          # Auth-related UI pages (Login, Register, etc.)
│   │   │   ├── store/          # Zustand stores for Auth feature
│   │   │   ├── services/       # Business logic and orchestration
│   │   │   └── repositories/   # API/data access layer (e.g. userRepository.ts)
│   │   └── dashboard/
│   │       ├── pages/
│   │       ├── store/
│   │       ├── services/
│   │       └── repositories/
│   │
│   ├── shared/                 # Common reusable logic & UI
│   │   ├── components/         # Reusable UI components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Helper functions
│   │   ├── store/              # Shared Zustand stores (global theme, etc.)
│   │   └── types/              # Shared TypeScript types/interfaces
│   │
│   └── assets/                 # Static assets (images, fonts, SVGs)
│
├── .eslint.config.js           # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md


```

---

## Scripts

| Command        | Description                          |
| -------------- | ------------------------------------ |
| `yarn dev`     | Run the dev server (Vite)            |
| `yarn build`   | Build the production bundle          |
| `yarn preview` | Preview the production build locally |
| `yarn lint`    | Run ESLint across the project        |
| `yarn format`  | Format code using Prettier           |
| `yarn prepare` | Initialize Husky hooks               |
| `yarn test`    | Dummy test script (placeholder)      |

---

## Installation

```bash
# Clone repository
git clone https://github.com/alpinnz/react-app-boilerplate.git
cd react-app-boilerplate

# Install dependencies
yarn install

# Setup Husky
yarn prepare

# Start development
yarn dev

```

---

## Configuration

**.env Example**

```env
VITE_APP_NAME=ReactViteBoilerplate
VITE_API_URL=https://api.example.com
```

**vite.config.ts (Alias Example)**

```markdown
resolve: {
alias: {
'@': path.resolve(\_\_dirname, './src'),
},
},
```

---

## Development Standards

- **ESLint & Prettier** → konsistensi style code
- **Absolute Imports** → pakai `@/` untuk path pendek
- **Husky + lint-staged (opsional)** → lint sebelum commit
- **Hot Reloading** → Vite dev server cepat

---

## Design Philosophy

1. **Composable** — Setiap module bisa dibangun atau diganti independen.
2. **Configurable** — Perilaku diatur lewat env & config file.
3. **Scalable** — Struktur berbasis fitur, mudah berkembang.
4. **Type-Safe** — TypeScript penuh dari UI ke store.
5. **Production-Ready** — SWC, lazy loading, dan optimisasi build.

---

## Future Roadmap

- [ ] Authentication Flow
- [ ] Dark Mode Switcher
- [ ] i18n Language Switcher
- [ ] API Service Layer with Axios Interceptors
- [ ] Husky + lint-staged Pre-commit Setup

---

## Deployment

- **Vercel** → otomatis dari branch `main`
- **Netlify** → gunakan output `dist/`
- **GitHub Pages** → deploy via `gh-pages -d dist`

---

## License

MIT © 2025 — Built by [Alfin Noviaji](https://github.com/alpinnz)
