import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'quiet'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-action text-on-action hover:bg-action-hover',
  secondary: 'border border-line-strong bg-surface text-action hover:bg-action-soft',
  danger: 'bg-danger text-on-danger hover:bg-danger-hover',
  quiet: 'bg-transparent text-danger hover:bg-danger-soft',
}

/** Tombol dasar dengan varian visual semantic dan seluruh atribut tombol native. */
export function Button({ variant = 'primary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-4 py-2 text-sm font-semibold shadow-sm transition-[background-color,border-color,color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
