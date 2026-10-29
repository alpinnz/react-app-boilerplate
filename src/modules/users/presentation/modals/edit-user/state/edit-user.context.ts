import { createContext } from 'react'
import type { EditUserStoreApi } from './edit-user.store'

/** Context state form yang hanya tersedia di dalam modal edit. */
export const EditUserContext = createContext<EditUserStoreApi | null>(null)
