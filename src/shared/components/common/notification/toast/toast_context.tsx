import { createContext } from "react";
import type { ToastType } from "@/shared/components/common/notification/toast/toast.tsx";

export interface IToastContext {
  message?: string;
  type?: ToastType;
  title?: string;
  exception?: Error;
}

type ToastContextProps = {
  showToast: (toast: IToastContext) => void;
};

export const ToastContext = createContext<ToastContextProps | undefined>(undefined);
