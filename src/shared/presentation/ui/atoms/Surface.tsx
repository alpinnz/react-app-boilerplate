import type { HTMLAttributes } from 'react'

/** Wadah semantik untuk mengelompokkan konten pada permukaan desain. */
export function Surface({ className = '', ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={`rounded-surface border border-line bg-surface p-4 shadow-surface sm:p-5 lg:p-6 ${className}`} {...props} />
}
