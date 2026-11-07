import { forwardRef, type ReactNode } from 'react'
import { Button, type ButtonProps } from './Button'
import type { ButtonSize } from './button-styles'

type IconButtonProps = Omit<ButtonProps, 'children' | 'className' | 'loading' | 'loadingLabel' | 'loadingPresentation'> & {
  'aria-label': string
  children: ReactNode
  className?: string
}

const squareSizeClasses: Record<ButtonSize, string> = {
  small: 'size-9 !min-h-9 !min-w-9 !gap-0 !px-0 !py-0',
  medium: 'size-10 !min-h-10 !min-w-10 !gap-0 !px-0 !py-0',
  large: 'size-12 !min-h-12 !min-w-12 !gap-0 !px-0 !py-0',
}

/** Icon-only action that reuses Button variants, focus, disabled, and sizing behavior. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton({
  size = 'medium',
  variant = 'neutral',
  className = '',
  ...props
}, ref) {
  return <Button ref={ref} size={size} variant={variant} className={`${squareSizeClasses[size]} ${className}`} {...props} />
})
