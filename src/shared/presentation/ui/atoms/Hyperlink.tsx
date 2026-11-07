import { forwardRef, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type HyperlinkProps = Omit<LinkProps, 'className'> & {
  className?: string
  trailingIcon?: ReactNode
  treatment?: 'neutral' | 'solid'
}

const treatmentClasses = {
  neutral: 'text-content hover:text-action visited:text-content',
  solid: 'text-action visited:text-action',
}

/** Inline navigation link with neutral/solid treatments and app typography tokens. */
export const Hyperlink = forwardRef<HTMLAnchorElement, HyperlinkProps>(function Hyperlink({
  children,
  className = '',
  trailingIcon,
  treatment = 'neutral',
  ...props
}, ref) {
  return (
    <Link
      ref={ref}
      className={`text-app-hyperlink-regular-regular underline-offset-4 transition-colors hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${treatmentClasses[treatment]} ${className}`}
      {...props}
    >
      {children}
      {trailingIcon && <span aria-hidden="true" className="ml-1 inline-flex">{trailingIcon}</span>}
    </Link>
  )
})
