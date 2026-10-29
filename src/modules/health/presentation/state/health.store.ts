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
  }>()((set) => ({
    health: initialDataState(),
    load: async () => {
      if (controller) return
      controller = new AbortController()
      const active = controller
      set({ health: { data: null, status: { type: 'loading' } } })
      try {
        const result = await getHealth(active.signal)
        if (active.signal.aborted) return
        set({ health: result.ok ? { data: result.data, status: { type: 'success' } } : { data: null, status: { type: 'failure', failure: result.failure } } })
      } finally { if (controller === active) controller = null }
    },
    cancelPending: () => { controller?.abort(); controller = null },
  }))
}

/** Tipe API Zustand yang dihasilkan oleh {@link createHealthStore}. */
export type HealthStoreApi = ReturnType<typeof createHealthStore>
