import { useCallback, useState, type ReactNode } from 'react'
import { AuthenticatedHeader } from '../shell/AuthenticatedHeader'
import { AuthenticatedSidebar } from '../shell/AuthenticatedSidebar'

/** Template halaman terautentikasi dengan header, sidebar, dan area konten. */
export function AppTemplate({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), [])

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-canvas">
      <AuthenticatedSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div inert={isSidebarOpen} className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AuthenticatedHeader onMenuOpen={() => setIsSidebarOpen(true)} />
        <main className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
