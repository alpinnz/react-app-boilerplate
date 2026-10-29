import { createContext } from 'react'
import type { SessionStoreApi } from './session.store'

/** Session store context consumed by app layouts and route guards. */
export const SessionContext = createContext<SessionStoreApi | null>(null)
