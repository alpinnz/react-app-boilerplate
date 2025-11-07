import type { IToastContext } from "@/shared/components/common/notification/toast/toast_context.tsx";

export type ToastFn = (args: IToastContext) => void;

let _toast: ToastFn = () => {};

export const ToastEffect = {
  set(toast: ToastFn) {
    _toast = toast;
  },
  toast: (...args: Parameters<ToastFn>) => _toast(...args),
};
