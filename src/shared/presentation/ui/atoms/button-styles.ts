export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'neutral-bordered' | 'danger' | 'quiet'
export type ButtonSize = 'small' | 'medium' | 'large'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-action text-on-action hover:bg-action-hover',
  secondary: 'border border-line-strong bg-surface text-content hover:bg-canvas',
  tertiary: 'bg-transparent text-action hover:bg-action-soft disabled:hover:bg-transparent',
  neutral: 'bg-transparent text-content-muted hover:bg-sidebar-hover hover:text-content',
  'neutral-bordered': 'border border-line bg-surface text-content-muted hover:bg-canvas hover:text-content',
  danger: 'bg-danger text-on-danger hover:bg-danger-hover',
  quiet: 'bg-transparent text-danger hover:bg-danger-soft',
}

const sizeClasses: Record<ButtonSize, string> = {
  small: 'min-h-9 px-3 py-1',
  medium: 'min-h-10 px-4 py-2',
  large: 'min-h-12 px-6 py-3',
}

export function getButtonClassName(variant: ButtonVariant, size: ButtonSize, className = '') {
  return `relative inline-flex items-center justify-center gap-2 rounded-control text-app-button-text-medium transition-[background-color,border-color,color,box-shadow,opacity] active:opacity-[0.85] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`
}
