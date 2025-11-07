import type { ReactNode } from "react";
import classNames from "classnames";

type Variant = "primary" | "outline" | "ghost" | "link";
type Color = "primary" | "secondary" | "danger" | "success" | "warning" | "info";
type Size = "xs" | "sm" | "md" | "lg" | "xl";
type Rounded = "none" | "sm" | "md" | "lg" | "xl" | "full";

export interface ButtonProps {
  type?: "button" | "submit" | "reset";
  variant?: Variant;
  size?: Size;
  color?: Color;
  rounded?: Rounded;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  label?: string;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const sizeMap: Record<Size, string> = {
  xs: "px-2 py-1 text-l10-medium",
  sm: "px-3 py-1.5 text-l12-medium",
  md: "px-4 py-2 text-l14-medium",
  lg: "px-5 py-2.5 text-l16-medium",
  xl: "px-6 py-3 text-l18-medium",
};

const roundedMap: Record<Rounded, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

const variantMap: Record<Variant, Record<Color, string>> = {
  primary: {
    primary: "bg-primary-500 text-neutral-50 hover:bg-primary-400",
    secondary: "bg-secondary-500 text-neutral-50 hover:bg-secondary-400",
    danger: "bg-danger-500 text-neutral-50 hover:bg-danger-400",
    success: "bg-success-500 text-neutral-50 hover:bg-success-400",
    warning: "bg-warning-500 text-neutral-50 hover:bg-warning-400",
    info: "bg-info-500 text-neutral-50 hover:bg-info-400",
  },
  outline: {
    primary: "border border-primary-500 text-primary-500 hover:bg-primary-50",
    secondary: "border border-secondary-500 text-secondary-500 hover:bg-secondary-50",
    danger: "border border-danger-500 text-danger-500 hover:bg-danger-50",
    success: "border border-success-500 text-success-500 hover:bg-success-50",
    warning: "border border-warning-500 text-warning-500 hover:bg-warning-50",
    info: "border border-info-500 text-info-500 hover:bg-info-50",
  },
  ghost: {
    primary: "bg-transparent text-primary-500 hover:bg-primary-100",
    secondary: "bg-transparent text-secondary-500 hover:bg-secondary-100",
    danger: "bg-transparent text-danger-500 hover:bg-danger-100",
    success: "bg-transparent text-success-500 hover:bg-success-100",
    warning: "bg-transparent text-warning-500 hover:bg-warning-100",
    info: "bg-transparent text-info-500 hover:bg-info-100",
  },
  link: {
    primary: "bg-transparent text-primary-500 underline hover:text-primary-700",
    secondary: "bg-transparent text-secondary-500 underline hover:text-secondary-700",
    danger: "bg-transparent text-danger-500 underline hover:text-danger-700",
    success: "bg-transparent text-success-500 underline hover:text-success-700",
    warning: "bg-transparent text-warning-500 underline hover:text-warning-700",
    info: "bg-transparent text-info-500 underline hover:text-info-700",
  },
};

export function Button(props: ButtonProps) {
  const {
    type = "button",
    variant = "primary",
    size = "md",
    color = "primary",
    rounded = "md",
    iconLeft,
    iconRight,
    label,
    loading = false,
    disabled = false,
    fullWidth = false,
    className,
  } = props;

  const baseClasses =
    "inline-flex items-center justify-center text-l14-semibold shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  const composedClasses = classNames(
    baseClasses,
    sizeMap[size],
    roundedMap[rounded],
    variantMap[variant][color],
    {
      "w-full": fullWidth,
      "opacity-50 cursor-not-allowed": disabled || loading,
    },
    className
  );

  return (
    <button type={type} className={composedClasses} disabled={disabled || loading}>
      {loading ? (
        <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-app-default rounded-full mr-2" />
      ) : (
        iconLeft && <span className="mr-2">{iconLeft}</span>
      )}
      {label}
      {!loading && iconRight && <span className="ml-2">{iconRight}</span>}
    </button>
  );
}
