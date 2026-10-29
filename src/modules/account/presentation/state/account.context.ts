import { createContext } from 'react'
import type { AccountStoreApi } from './account.store'

/** Context state halaman akun; harus dipasok oleh AccountPage. */
export const AccountContext = createContext<AccountStoreApi | null>(null)
