import { createContext } from 'react'
import type { DeleteUserStoreApi } from './delete-user.store'

/** Context state tindakan yang hanya tersedia selama dialog hapus terpasang. */
export const DeleteUserContext = createContext<DeleteUserStoreApi | null>(null)
