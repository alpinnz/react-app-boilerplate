import type { StateCreator } from "zustand";
import type { Auth } from "@/core/models/auth.ts";
import { AuthStorageService } from "@/core/services/auth_storage_service.ts";
import { authRepository } from "@/features/auth/repositories/auth_repository/auth_repository.ts";
import { handleException } from "@/core/exceptions/handle_exceptions.ts";
import { AppCommonEffect } from "@/features/app/providers/app_common/app.common.effect.ts";

export interface AuthState {
  auth: Auth | null;
  initial: () => void;
  login: (auth: Auth) => void;
  logout: () => void;
}

export const createAuthState: StateCreator<AuthState> = (set) => ({
  auth: null,
  initial: () => {
    const auth = AuthStorageService.get();
    set({ auth: auth });
  },
  login: (auth: Auth) => {
    AuthStorageService.save(auth);
    set({ auth: auth });
  },
  logout: async () => {
    try {
      const auth = AuthStorageService.get();
      const res = await authRepository.Logout({ refresh_token: auth?.refresh_token ?? "" });

      if (res.isLeft()) {
        throw res.error;
      }
      if (res.isRight()) {
        AuthStorageService.clear();
        set({ auth: null });
        AppCommonEffect.navigate("/auth/login", { replace: true });
      }
    } catch (err) {
      AppCommonEffect.toast({ exception: handleException(err) });
    }
  },
});
