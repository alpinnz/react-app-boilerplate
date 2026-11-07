import { useCallback, useState, type ReactNode } from 'react'
import { AuthenticatedHeader } from '../shell/AuthenticatedHeader'
import { AuthenticatedSidebar } from '../shell/AuthenticatedSidebar'
import { PageFrame } from './PageFrame'
import { PageShell } from './PageShell'
import { appBrand } from '@/config/brand'

/** Template halaman terautentikasi dengan header, sidebar, dan area konten. */
export function AppTemplate({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), [])
  const toggleSidebar = useCallback(() => setIsSidebarCollapsed((collapsed) => !collapsed), [])

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-canvas">
      <AuthenticatedSidebar isOpen={isSidebarOpen} isCollapsed={isSidebarCollapsed} onClose={closeSidebar} onToggleCollapse={toggleSidebar} />
      <div inert={isSidebarOpen} className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AuthenticatedHeader onMenuOpen={() => setIsSidebarOpen(true)} />
        <PageFrame variant="application">
          <div className="flex min-h-full w-full min-w-0 flex-1 flex-col gap-section">
            <PageShell className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
              <div className="min-w-0 flex-1">{children}</div>
            </PageShell>
            <footer className="flex min-h-10 shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-surface bg-surface px-surface py-form text-app-caption-regular text-content-muted shadow-surface">
              <span>© {new Date().getFullYear()} {appBrand.name}</span>
              <span>{appBrand.description}</span>
            </footer>
          </div>
        </PageFrame>
      </div>
    </div>
  )
}
