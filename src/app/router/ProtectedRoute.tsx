import { useContext, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useStore } from 'zustand'
import { authRoutePaths, SessionContext } from '@/modules/auth'
import { PageFrame } from '../templates/PageFrame'
import { PageShell } from '../templates/PageShell'

/** Mengarahkan pengguna tanpa session ke halaman login sebelum menampilkan route. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const store = useContext(SessionContext)
  if (!store) throw new Error('SessionProvider belum dipasang.')
  const session = useStore(store, (state) => state.session)
  if (session.status.type === 'loading') return <PageFrame variant="centered"><PageShell><div role="status" aria-live="polite">Memulihkan sesi…</div></PageShell></PageFrame>
  return session.data ? children : <Navigate to={authRoutePaths.login} replace />
}
