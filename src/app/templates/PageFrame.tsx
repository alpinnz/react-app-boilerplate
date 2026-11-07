import type { ReactNode } from 'react'

type PageFrameProps = {
  children: ReactNode
  className?: string
  variant: 'application' | 'centered' | 'onboarding'
}

const variantClasses: Record<PageFrameProps['variant'], string> = {
  application: 'flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain bg-canvas px-page-gutter py-page-block',
  centered: 'flex min-h-dvh items-center justify-center bg-canvas px-page-gutter py-page-block',
  onboarding: 'flex min-h-dvh flex-col overflow-x-hidden bg-canvas px-page-gutter py-page-block',
}

/** Responsive viewport frame for route scrolling and alignment. */
export function PageFrame({ children, className = '', variant }: PageFrameProps) {
  return <main className={`${variantClasses[variant]} ${className}`}>{children}</main>
}
