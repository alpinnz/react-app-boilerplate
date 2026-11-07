import type { ReactNode } from 'react'
import { LanguageSwitcher } from '../localization/LanguageSwitcher'
import { ThemeToggleButton } from '../theme/ThemeToggleButton'
import { PageFrame } from './PageFrame'
import { PageShell } from './PageShell'
import { appBrand } from '@/config/brand'
import { assets } from '@/shared/assets/generated/assets'

type AuthTemplateProps = {
  children: ReactNode
  variant?: 'auth' | 'standalone'
}

/** Menyediakan frame autentikasi atau layout publik tanpa mengubah isi halaman. */
export function AuthTemplate({ children, variant = 'auth' }: AuthTemplateProps) {
  if (variant === 'standalone') {
    return (
      <PageFrame variant="centered">
        <PageShell
          className="w-full max-w-md overflow-hidden p-0"
          titleSectionClassName="mb-0"
          titleSection={<header className="flex items-center justify-between gap-3 border-b border-line px-surface py-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-control bg-action text-app-body-regular-bold text-on-action">{appBrand.mark}</span>
              <span className="min-w-0">
                <strong className="block truncate text-app-body-regular-semi-bold text-content">{appBrand.name}</strong>
                <span className="block truncate text-app-caption-regular text-content-muted">{appBrand.description}</span>
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <ThemeToggleButton />
              <LanguageSwitcher />
            </div>
          </header>}
        >
          <div className="p-surface">{children}</div>
        </PageShell>
      </PageFrame>
    )
  }

  return (
    <PageFrame variant="centered">
      <PageShell className="grid w-full max-w-5xl overflow-hidden p-0 lg:min-h-[36rem] lg:grid-cols-[minmax(22rem,0.88fr)_minmax(0,1.12fr)]">
        <section className="flex min-w-0 flex-col justify-center">
          <header className="flex items-center justify-between gap-3 border-b border-line px-surface py-3.5 lg:border-b-0 lg:pb-0 lg:pt-7">
            <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-control bg-action text-app-body-regular-bold text-on-action">{appBrand.mark}</span>
            <span className="mr-auto min-w-0">
              <strong className="block truncate text-app-body-regular-bold text-content">{appBrand.name}</strong>
              <span className="block truncate text-app-caption-regular text-content-muted">{appBrand.description}</span>
            </span>
            <div className="flex shrink-0 items-center gap-2">
              <ThemeToggleButton />
              <LanguageSwitcher />
            </div>
          </header>
          <div className="p-surface md:p-6 lg:px-8 lg:py-7">
            <div className="mx-auto w-full max-w-sm">{children}</div>
          </div>
        </section>
        <div className="relative hidden min-h-full items-center justify-center overflow-hidden border-l border-line bg-canvas p-8 lg:flex" aria-hidden="true">
          <div className="absolute inset-8 rounded-surface border border-line bg-surface" />
          <img
            src={assets.auth.workspaceOverview}
            alt=""
            width={1024}
            height={800}
            decoding="async"
            className="relative z-10 h-auto w-full max-w-[34rem] object-contain"
          />
        </div>
      </PageShell>
    </PageFrame>
  )
}
