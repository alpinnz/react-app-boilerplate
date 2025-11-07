import {
  NavigateEffect,
  type NavigateFn,
} from "@/features/app/providers/app_common/effect/app.navigate.effect.ts";
import { ToastEffect, type ToastFn } from "./effect/app.toast.effect.ts";

export const AppCommonEffect = {
  set({ navigate, toast }: { navigate: NavigateFn; toast: ToastFn }) {
    NavigateEffect.set(navigate);
    ToastEffect.set(toast);
  },
  navigate: NavigateEffect.navigate,
  toast: ToastEffect.toast,
};
