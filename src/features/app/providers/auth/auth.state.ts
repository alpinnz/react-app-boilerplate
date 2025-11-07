import type { StateCreator } from "zustand";
import type { Auth } from "@/core/models/auth.ts";
import { AuthStorageService } from "@/core/services/auth_storage_service.ts";
import { authRepository } from "@/features/auth/repositories/auth_repository/auth_repository.ts";
import { handleException } from "@/core/exceptions/handle_exceptions.ts";
import { AppCommonEffect } from "@/features/app/providers/app_common/app.common.effect.ts";

export interface AuthState {
  auth: Auth | null;
  initial: () => void;
  initialLoading: boolean;
  login: (auth: Auth) => void;
  logout: () => void;
  logoutLoading: boolean;
}

export const createAuthState: StateCreator<AuthState> = (set) => ({
  auth: null,
  initialLoading: false,
  initial: async () => {
    try {
      set({ initialLoading: true });
      const auth = AuthStorageService.get();

      if (auth) {
        const res = await authRepository.Refresh({ refresh_token: auth?.refresh_token ?? "" });
        if (res.isLeft()) {
          AuthStorageService.clear();
          set({ auth: null });
        }
        if (res.isRight()) {
          AuthStorageService.save(res.value);
          set({ auth: res.value });
        }
      }
    } catch (err) {
      AppCommonEffect.toast({ exception: handleException(err) });
    } finally {
      set({ initialLoading: false });
    }
  },
  login: async (auth: Auth) => {
    AuthStorageService.save(auth);
    set({ auth: auth });
  },
  logout: async () => {
    try {
      set({ logoutLoading: true });
      const auth = AuthStorageService.get();
      const res = await authRepository.Logout({ refresh_token: auth?.refresh_token ?? "" });

      if (res.isLeft()) {
        AuthStorageService.clear();
        set({ auth: null });
        AppCommonEffect.navigate("/auth/login", { replace: true });
      }
      if (res.isRight()) {
        AuthStorageService.clear();
        set({ auth: null });
        AppCommonEffect.navigate("/auth/login", { replace: true });
      }
    } catch (err) {
      AppCommonEffect.toast({ exception: handleException(err) });
    } finally {
      set({ logoutLoading: false });
    }
  },
  logoutLoading: false,
});
