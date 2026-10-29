import { createStore } from 'zustand/vanilla'
import type { User } from '@/modules/users/domain/entities/user'
import type { UserFailure } from '@/modules/users/domain/failures/user.failure'
import type { UpdateUser } from '@/modules/users/domain/usecases/update-user.usecase'
import type { DataStatus } from '@/shared/presentation/state/data-status'

/** State form edit dan status penyimpanan untuk satu modal pengguna. */
export type EditUserStore = {
  name: string
  phoneNumber: string
  countryCode: string
  status: DataStatus<UserFailure>
  setName: (name: string) => void
  setPhoneNumber: (phoneNumber: string) => void
  setCountryCode: (countryCode: string) => void
  save: () => Promise<User | null>
  cancelPending: () => void
}

/** Membuat state form per modal dan mencegah hasil simpan usang mengubah UI. */
export function createEditUserStore(user: User, updateUser: UpdateUser) {
  let controller: AbortController | null = null
  let sequence = 0

  return createStore<EditUserStore>()((set, get) => ({
    name: user.name,
    phoneNumber: user.phoneNumber ?? '',
    countryCode: user.countryCode ?? '',
    status: { type: 'initial' },
    setName: (name) => set({ name }),
    setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
    setCountryCode: (countryCode) => set({ countryCode }),
    save: async () => {
      if (controller) return null
      controller = new AbortController()
      const activeController = controller
      const requestId = ++sequence
      set({ status: { type: 'loading' } })
      try {
        const { name, phoneNumber, countryCode } = get()
        const result = await updateUser({ id: user.id, name, phoneNumber, countryCode }, activeController.signal)
        if (requestId !== sequence || activeController.signal.aborted) return null
        if (!result.ok) {
          set({ status: { type: 'failure', failure: result.failure } })
          return null
        }
        set({ status: { type: 'success' } })
        return result.data
      } catch {
        if (requestId !== sequence || activeController.signal.aborted) return null
        set({ status: { type: 'failure', failure: { kind: 'unexpected', message: 'Gagal menyimpan pengguna.' } } })
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

/** Tipe API Zustand yang dihasilkan oleh {@link createEditUserStore}. */
export type EditUserStoreApi = ReturnType<typeof createEditUserStore>
