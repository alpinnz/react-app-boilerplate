import { type FC, type ReactNode, useRef } from "react";
import { createStore, type StoreApi } from "zustand/vanilla";
import type { AuthState } from "./auth.state.ts";
import { createAuthState } from "./auth.state.ts";
import { AuthContext } from "./auth.context.tsx";

const createScopedAuthStore = () => createStore<AuthState>(createAuthState);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const storeRef = useRef<StoreApi<AuthState> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createScopedAuthStore();
    storeRef.current.getState().initial();
  }

  return <AuthContext.Provider value={storeRef.current}>{children}</AuthContext.Provider>;
};
