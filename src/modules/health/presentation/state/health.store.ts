import { createStore } from 'zustand/vanilla'
import { initialDataState, type DataState } from '@/shared/presentation/state/data-state'
import type { OperationFailure } from '@/shared/domain/operation-failure'
import type { HealthStatus } from '../../domain/entities/health-status'
import type { GetHealth } from '../../domain/usecases/get-health.usecase'

/** Membuat state pemeriksaan health dengan request yang dapat dibatalkan. */
export function createHealthStore(getHealth: GetHealth) {
  let controller: AbortController | null = null
  return createStore<{
    health: DataState<HealthStatus, OperationFailure>
    load: () => Promise<void>
    cancelPending: () => void
    }>()((set, get) => ({
    health: initialDataState(),
    load: async () => {
      if (controller) return
      controller = new AbortController()
      const active = controller
      const previousHealth = get().health.data
      set({ health: { data: previousHealth, status: { type: previousHealth ? 'refreshing' : 'loading' } } })
      try {
        const result = await getHealth(active.signal)
        if (active.signal.aborted) return
        set({ health: result.ok ? { data: result.data, status: { type: 'success' } } : { data: previousHealth, status: { type: 'failure', failure: result.failure } } })
      } catch {
        if (!active.signal.aborted) set({ health: { data: previousHealth, status: { type: 'failure', failure: { kind: 'unexpected', message: 'Gagal memuat status layanan.' } } } })
      } finally { if (controller === active) controller = null }
    },
    cancelPending: () => { controller?.abort(); controller = null },
  }))
}

/** Tipe API Zustand yang dihasilkan oleh {@link createHealthStore}. */
export type HealthStoreApi = ReturnType<typeof createHealthStore>
