import { createContext } from 'react'
import type { RegisterStoreApi } from './register.store'

/** Context state form registrasi selama halaman daftar terpasang. */
export const RegisterContext = createContext<RegisterStoreApi | null>(null)
