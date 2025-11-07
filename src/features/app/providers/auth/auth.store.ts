// /src/app/core/controllers/auth/auth_store.ts
import { createStore } from "zustand/vanilla";
import type { AuthState } from "./auth.state.ts";
import { createAuthState } from "./auth.state.ts";

export const authStore = createStore<AuthState>(createAuthState);
