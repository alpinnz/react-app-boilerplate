import { createStore } from 'zustand/vanilla'
import type { DeleteUser } from '@/modules/users/domain/usecases/delete-user.usecase'
import type { UserFailure } from '@/modules/users/domain/failures/user.failure'
import type { DataStatus } from '@/shared/presentation/state/data-status'

/** Status dan tindakan untuk menghapus satu pengguna dari dialog konfirmasi. */
export type DeleteUserStore = {
  status: DataStatus<UserFailure>
  remove: () => Promise<string | null>
  cancelPending: () => void
}

/** Membuat store penghapusan per dialog dengan proteksi submit ganda dan cleanup. */
export function createDeleteUserStore(userId: string, deleteUser: DeleteUser) {
  let controller: AbortController | null = null
  let sequence = 0
  return createStore<DeleteUserStore>()((set) => ({
    status: { type: 'initial' },
    remove: async () => {
      if (controller) return null
      controller = new AbortController()
      const activeController = controller
      const requestId = ++sequence
      set({ status: { type: 'loading' } })
      try {
        const result = await deleteUser(userId, activeController.signal)
        if (requestId !== sequence || activeController.signal.aborted) return null
        if (!result.ok) {
          set({ status: { type: 'failure', failure: result.failure } })
          return null
        }
        set({ status: { type: 'success' } })
        return result.data
      } catch {
        if (requestId !== sequence || activeController.signal.aborted) return null
        set({ status: { type: 'failure', failure: { kind: 'unexpected', message: 'Gagal menghapus pengguna.' } } })
        return null
      } finally {
        if (requestId === sequence) controller = null
      }
    },
    cancelPending: () => {
      ++sequence
      controller?.abort()
      controller = null
    },
  }))
}

/** Tipe API Zustand yang dihasilkan oleh {@link createDeleteUserStore}. */
export type DeleteUserStoreApi = ReturnType<typeof createDeleteUserStore>
