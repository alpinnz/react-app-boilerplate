import { createContext, useContext } from "react";
import { useStore } from "zustand";
import { type StoreApi } from "zustand/vanilla";
import type { AuthState } from "./auth.state.ts";

export const AuthContext = createContext<StoreApi<AuthState> | null>(null);

export const useAuthContext = <T,>(selector: (state: AuthState) => T): T => {
  const store = useContext(AuthContext);
  if (!store) throw new Error("useAuthContext must be used within <AuthProvider>");
  return useStore(store, selector);
};
