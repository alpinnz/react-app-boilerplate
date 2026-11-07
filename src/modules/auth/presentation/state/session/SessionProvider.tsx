import { useEffect, useMemo, type ReactNode } from 'react'
import type { Login } from '../../../domain/usecases/login.usecase'
import type { Logout } from '../../../domain/usecases/logout.usecase'
import type { RestoreSession } from '../../../domain/usecases/restore-session.usecase'
import { SessionContext } from './session.context'
import { createSessionStore } from './session.store'

/** Provides a session store scoped to the application tree. */
export function SessionProvider({ login, logout, restoreSession, subscribeSessionInvalidated, children }: {
  login: Login
  logout: Logout
  restoreSession?: RestoreSession
  subscribeSessionInvalidated: (listener: () => void) => () => void
  children: ReactNode
}) {
  const store = useMemo(() => createSessionStore({ login, logout, restoreSession }), [login, logout, restoreSession])
  useEffect(() => {
    const unsubscribe = subscribeSessionInvalidated(() => store.getState().invalidate())
    void store.getState().restoreSession?.()
    return () => {
      unsubscribe()
      store.getState().cancelPending()
    }
  }, [store, subscribeSessionInvalidated])
  return <SessionContext.Provider value={store}>{children}</SessionContext.Provider>
}
