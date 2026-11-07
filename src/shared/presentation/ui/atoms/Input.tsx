import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement>

/** Input dasar yang mempertahankan atribut native, state invalid, dan focus token. */
export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`block h-10 w-full min-w-0 rounded-control border border-line-strong bg-surface px-3 py-2 text-app-body-regular-regular text-content placeholder:text-content-muted focus:border-focus focus:ring-2 focus:ring-focus/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger ${className}`}
      {...props}
    />
  )
}
