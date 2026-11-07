import { forwardRef } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { getButtonClassName, type ButtonSize, type ButtonVariant } from './button-styles'

type ButtonLinkProps = Omit<LinkProps, 'className'> & {
  className?: string
  size?: ButtonSize
  variant?: ButtonVariant
}

/** Navigation link presented with the same tokenized hierarchy as Button. */
export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(function ButtonLink({
  className = '',
  size = 'medium',
  variant = 'primary',
  ...props
}, ref) {
  return <Link ref={ref} className={getButtonClassName(variant, size, className)} {...props} />
})
