import { useContext, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useStore } from 'zustand'
import { authRoutePaths, SessionContext } from '@/modules/auth'

/** Mengarahkan pengguna tanpa session ke halaman login sebelum menampilkan route. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const store = useContext(SessionContext)
  if (!store) throw new Error('SessionProvider belum dipasang.')
  const session = useStore(store, (state) => state.session.data)
  return session ? children : <Navigate to={authRoutePaths.login} replace />
}
