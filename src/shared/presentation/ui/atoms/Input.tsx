import type { InputHTMLAttributes } from 'react'

/** Input dasar yang mempertahankan atribut native, state invalid, dan focus token. */
export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`block min-h-11 w-full rounded-control border border-line-strong bg-surface px-3 py-2 text-content placeholder:text-content-muted focus:border-focus focus:ring-2 focus:ring-focus/25 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger ${className}`}
      {...props}
    />
  )
}
