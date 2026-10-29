import { createContext } from 'react'
import type { UserListStoreApi } from './user-list.store'

/** Context store daftar yang hidup hanya selama scope halaman pengguna. */
export const UserListContext = createContext<UserListStoreApi | null>(null)
