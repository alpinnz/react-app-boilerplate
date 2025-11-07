import { type ReactNode, useState } from "react";
import { Toast, type ToastType } from "@/shared/components/common/notification/toast/toast.tsx";
import { ToastContext } from "@/shared/components/common/notification/toast/toast_context.tsx";

type IShowToast = {
  message?: string;
  type?: ToastType;
  title?: string;
  exception?: Error;
};

type ToastItem = {
  id: number;
  title?: string;
  message?: string;
  type?: ToastType;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (toast: IShowToast) => {
    const id = Date.now();
    let type = toast.type;
    let message = toast.message;
    if (toast?.exception?.name != null) {
      type = getToastTypeFromException(toast?.exception?.name);
      message = toast?.exception?.message ?? "Terjadi kesalahan";
    }
    const newToast: ToastItem = { id, message: message, type: type, title: toast.title };
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after 3.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed top-4 right-4 z-50 space-y-2 w-[320px] max-w-full">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            title={toast.title}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

function getToastTypeFromException(
  exceptionName?: string
): "danger" | "warning" | "info" | "neutral" {
  switch (exceptionName) {
    case "ConnectionException":
      return "info";
    case "ServerException":
      return "danger";
    case "DatabaseException":
      return "danger";
    case "ValidationError":
      return "danger";
    case "ClientException":
      return "warning";
    case "UnauthorizedError":
      return "info";
    default:
      return "danger";
  }
}
