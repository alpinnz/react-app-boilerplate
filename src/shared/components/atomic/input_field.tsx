import * as React from "react";
import { type ChangeEvent } from "react";
import classNames from "classnames";

type Type = "text" | "email" | "password" | "number" | "tel" | "url" | "search" | "date" | "time";
type Variant = "outline" | "filled" | "flushed" | "unstyled";
type State = "default" | "danger" | "success" | "disabled" | "readonly";
type Size = "xs" | "sm" | "md" | "lg" | "xl";
type Rounded = "none" | "sm" | "md" | "lg" | "xl";

interface InputFieldProps {
  id?: string;
  name?: string;
  label?: string;
  type?: Type;
  variant?: Variant;
  state?: State;
  size?: Size;
  rounded?: Rounded;
  value?: string;
  placeholder?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  onSubmit?: (e: ChangeEvent<HTMLInputElement>) => void;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

// Ukuran padding dan teks
const sizeMap: Record<Size, string> = {
  xs: "px-2 py-1 text-l10-medium",
  sm: "px-3 py-1.5 text-l12-medium",
  md: "px-4 py-2 text-l14-medium",
  lg: "px-5 py-2.5 text-l16-medium",
  xl: "px-6 py-3 text-l18-medium",
};

// Bentuk sudut
const roundedMap: Record<Rounded, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
};

// Gaya border dan background
const variantMap: Record<Variant, string> = {
  outline: "border bg-app-surface",
  filled: "border bg-app-subtle",
  flushed: "border-b bg-transparent",
  unstyled: "border-none bg-transparent p-0",
};

// Warna berdasarkan state (menggunakan CSS Variable)
const stateMap: Record<State, string> = {
  default:
    "border-app-default text-app-primary focus:border-app-hover focus:ring-1 focus:ring-app-primary",
  danger:
    "border-app-danger text-app-danger focus:border-app-danger focus:ring-1 focus:ring-app-danger",
  success:
    "border-app-success text-app-success focus:border-app-success focus:ring-1 focus:ring-app-success",
  disabled: "bg-app-surface text-app-disabled border-app-disabled cursor-not-allowed",
  readonly: "bg-app-surface text-app-secondary border-app-muted cursor-default",
};

export function InputField(props: InputFieldProps) {
  const {
    id,
    name,
    label,
    type = "text",
    variant = "outline",
    state = "default",
    size = "md",
    rounded = "md",
    value,
    placeholder,
    onChange,
    onSubmit,
    error,
    prefix,
    suffix,
  } = props;

  const isDisabled = state === "disabled";
  const isReadOnly = state === "readonly";
  const effectiveState: State = error && !isDisabled && !isReadOnly ? "danger" : state;

  const inputClass = classNames(
    "flex-1 w-full focus:outline-none placeholder:text-app-secondary",
    sizeMap[size],
    {
      "cursor-not-allowed": isDisabled,
      "cursor-default": isReadOnly,
    }
  );

  const containerClass = classNames(
    "flex items-center",
    variantMap[variant],
    stateMap[effectiveState],
    roundedMap[rounded]
  );

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id || name} className="block mb-1 text-l14-medium text-app-primary">
          {label}
        </label>
      )}
      <div className={containerClass}>
        {prefix && <div className="px-2 text-app-icon">{prefix}</div>}
        <input
          id={id || name}
          name={name}
          type={type}
          className={inputClass}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          disabled={isDisabled}
          readOnly={isReadOnly}
          aria-disabled={isDisabled}
          aria-readonly={isReadOnly}
          onSubmit={onSubmit}
        />
        {suffix && <div className="px-2 text-app-icon">{suffix}</div>}
      </div>
      {(error || effectiveState === "danger") && (
        <div className="mt-1 text-l12-medium text-app-danger">{error}</div>
      )}
    </div>
  );
}
