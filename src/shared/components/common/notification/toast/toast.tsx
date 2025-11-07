import { Fragment, type ReactNode, useEffect, useState } from "react";
import { Transition } from "@headlessui/react";
import { X } from "lucide-react";
import classNames from "classnames";

export type ToastType = "success" | "danger" | "warning" | "info" | "neutral";

interface ToastProps {
  title?: string;
  message?: string;
  type?: ToastType;
  icon?: ReactNode;
  duration?: number; // in ms, default 3000
  onClose?: () => void;
}

const defaultIcons: Record<ToastType, ReactNode> = {
  success: <span className="feedback-app-success-icon">✔️</span>,
  danger: <span className="feedback-app-danger-icon">⛔</span>,
  warning: <span className="feedback-app-warning-icon">⚠️</span>,
  info: <span className="feedback-app-info-icon">ℹ️</span>,
  neutral: <span className="feedback-app-neutral-icon">🔔</span>,
};

export const Toast = ({
  title,
  message,
  type = "neutral",
  icon,
  duration = 3000,
  onClose,
}: ToastProps) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setShow(false);
        // Delay calling onClose until animation ends
        setTimeout(() => onClose?.(), 200);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose?.(), 200);
  };

  return (
    <Transition
      as={Fragment}
      show={show}
      enter="transition ease-out duration-300"
      enterFrom="opacity-0 translate-y-4"
      enterTo="opacity-100 translate-y-0"
      leave="transition ease-in duration-200"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 translate-y-4"
    >
      <div
        className={classNames(
          "rounded-lg p-4 border flex items-start gap-3 shadow-md max-w-md w-full",
          {
            "feedback-app-success-bg feedback-app-success-text feedback-app-success-border":
              type === "success",
          },
          {
            "feedback-app-danger-bg feedback-app-danger-text feedback-app-danger-border":
              type === "danger",
          },
          {
            "feedback-app-warning-bg feedback-app-warning-text feedback-app-warning-border":
              type === "warning",
          },
          {
            "feedback-app-info-bg feedback-app-info-text feedback-app-info-border": type === "info",
          },
          {
            "feedback-app-neutral-bg feedback-app-neutral-text feedback-app-neutral-border":
              type === "neutral",
          }
        )}
      >
        <div className="mt-1 shrink-0">{icon ?? defaultIcons[type]}</div>
        <div className="flex-1">
          {title && <p className="font-semibold leading-tight">{title}</p>}
          <p className="text-sm mt-1">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="p-1 rounded hover:bg-black/10 transition"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>
    </Transition>
  );
};
