import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { getButtonClassName, type ButtonSize, type ButtonVariant } from './button-styles'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  loadingLabel?: string
  loadingPresentation?: 'indicator' | 'indicator-with-label'
}

/** Tombol dasar dengan state semantic, indikator loading, ref, dan atribut tombol native. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  variant = 'primary',
  size = 'medium',
  className = '',
  loading = false,
  loadingLabel,
  loadingPresentation = 'indicator',
  disabled,
  children,
  'aria-busy': ariaBusy,
  ...props
}: ButtonProps, ref) {
  const loadingIndicator = <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-4 shrink-0 animate-spin motion-reduce:animate-none">
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2.5" />
    <path d="M10 3a7 7 0 0 1 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>

  return (
    <button
      ref={ref}
      className={getButtonClassName(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || ariaBusy}
      {...props}
    >
      {loading ? loadingPresentation === 'indicator-with-label' ? (
        <span className="inline-flex items-center gap-2">
          {loadingIndicator}
          <span>{loadingLabel ?? children}</span>
        </span>
      ) : <>
        <span aria-hidden="true" className="opacity-0">{children}</span>
        <span className="sr-only">{loadingLabel ?? children}</span>
        <span className="absolute inset-0 m-auto grid size-4 place-items-center">{loadingIndicator}</span>
      </> : children}
    </button>
  )
})
