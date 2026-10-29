import type { ReactNode } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { LanguageSwitcher } from '../localization/LanguageSwitcher'
import { appBrand } from '@/config/brand'

/** Template auth responsif yang membingkai form publik dengan brand aplikasi. */
export function AuthTemplate({ children }: { children: ReactNode }) {
  const { translate } = useLocalization()
  return (
    <div className="grid min-h-dvh bg-canvas lg:grid-cols-[minmax(24rem,0.9fr)_minmax(32rem,1.1fr)]">
      <aside className="relative hidden overflow-hidden bg-auth-panel p-10 text-on-auth-panel lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-action/20" aria-hidden="true" />
        <div className="absolute -bottom-40 -left-24 size-96 rounded-full border-[72px] border-on-auth-panel/5" aria-hidden="true" />
        <div className="relative flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-surface bg-action text-lg font-black text-on-action shadow-surface">{appBrand.mark}</div>
          <div><strong className="block text-lg leading-none">{appBrand.name}</strong><span className="text-xs text-on-auth-panel/70">{appBrand.description}</span></div>
        </div>
        <div className="relative max-w-lg">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-action">{translate('app.workspaceTagline')}</p>
          <p className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">{translate('app.workspaceHeadline')}</p>
          <p className="mt-6 max-w-md text-base leading-7 text-on-auth-panel/70">{translate('app.workspaceDescription')}</p>
        </div>
        <p className="relative text-xs text-on-auth-panel/80">{translate('app.workspaceFooter')}</p>
      </aside>
      <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-8 sm:px-8 lg:px-12">
        <div className="absolute right-0 top-0 size-64 rounded-full bg-action-soft blur-3xl" aria-hidden="true" />
        <div className="relative w-full max-w-xl">
        <div className="mb-6 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3 lg:hidden">
              <div className="grid size-10 shrink-0 place-items-center rounded-control bg-action font-black text-on-action">{appBrand.mark}</div>
              <div className="min-w-0"><strong className="block leading-none">{appBrand.name}</strong><span className="text-xs text-content-muted">{appBrand.description}</span></div>
            </div>
            <div className="ml-auto"><LanguageSwitcher /></div>
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
