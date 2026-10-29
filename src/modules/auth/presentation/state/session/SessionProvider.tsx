import { useEffect, useState, type ReactNode } from 'react'
import type { Login } from '../../../domain/usecases/login.usecase'
import type { Logout } from '../../../domain/usecases/logout.usecase'
import { SessionContext } from './session.context'
import { createSessionStore } from './session.store'

/** Provides a session store scoped to the application tree. */
export function SessionProvider({ login, logout, subscribeSessionInvalidated, children }: {
  login: Login
  logout: Logout
  subscribeSessionInvalidated: (listener: () => void) => () => void
  children: ReactNode
}) {
  const [store] = useState(() => createSessionStore({ login, logout }))
  useEffect(() => subscribeSessionInvalidated(() => store.getState().invalidate()), [store, subscribeSessionInvalidated])
  useEffect(() => () => store.getState().cancelPending(), [store])
  return <SessionContext.Provider value={store}>{children}</SessionContext.Provider>
}
