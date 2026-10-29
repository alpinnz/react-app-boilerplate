import { createContext } from 'react'
import type { UserDetailStoreApi } from './user-detail.store'

/** Context store detail yang dibatasi ke halaman user yang sedang dibuka. */
export const UserDetailContext = createContext<UserDetailStoreApi | null>(null)
