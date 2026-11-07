import type { HTMLAttributes } from 'react'

/** Wadah semantik untuk mengelompokkan konten pada permukaan desain. */
export function Surface({ className = '', ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={`rounded-surface border border-line bg-surface p-surface shadow-surface ${className}`} {...props} />
}
