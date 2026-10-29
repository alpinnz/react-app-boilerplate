import { createContext } from 'react'
import type { HealthStoreApi } from './health.store'

/** Context state health untuk halaman status layanan. */
export const HealthContext = createContext<HealthStoreApi | null>(null)
