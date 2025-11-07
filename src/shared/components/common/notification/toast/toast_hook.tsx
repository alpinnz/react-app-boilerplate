import { useContext } from "react";
import { ToastContext } from "@/shared/components/common/notification/toast/toast_context.tsx";

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};
