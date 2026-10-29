import { createContext } from 'react'
import type { RolesStoreApi } from './roles.store'

/** Context katalog role yang dibatasi ke halaman peran aktif. */
export const RolesContext = createContext<RolesStoreApi | null>(null)
