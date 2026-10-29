import { createStore } from 'zustand/vanilla'
import { initialDataState, type DataState } from '@/shared/presentation/state/data-state'
import type { OperationFailure } from '@/shared/domain/operation-failure'
import type { AccountProfile } from '../../domain/entities/account-profile'
import type { AccountUseCases } from '../../domain/usecases/account.usecases'

type Action = 'profile' | 'password' | 'deactivate'
type ActionStatus = { type: 'idle' | 'loading' | 'success'; action?: Action } | { type: 'failure'; action: Action; message: string }

/** Membuat state profil dan operasi akun untuk satu scope halaman account. */
export function createAccountStore(operations: AccountUseCases) {
  let controller: AbortController | null = null
  return createStore<{
    profile: DataState<AccountProfile, OperationFailure>
    name: string; phoneNumber: string; countryCode: string
    currentPassword: string; newPassword: string; confirmNewPassword: string; deactivatePassword: string
    actionStatus: ActionStatus
    setField: (field: 'name' | 'phoneNumber' | 'countryCode' | 'currentPassword' | 'newPassword' | 'confirmNewPassword' | 'deactivatePassword', value: string) => void
    load: () => Promise<void>
    saveProfile: () => Promise<string | null>
    changePassword: () => Promise<boolean>
    deactivate: () => Promise<boolean>
    cancelPending: () => void
  }>()((set, get) => ({
    profile: initialDataState(),
    name: '', phoneNumber: '', countryCode: '',
    currentPassword: '', newPassword: '', confirmNewPassword: '', deactivatePassword: '',
    actionStatus: { type: 'idle' },
    setField: (field, value) => set({ [field]: value, actionStatus: { type: 'idle' } }),
    load: async () => {
      if (controller) return
      controller = new AbortController()
      const active = controller
      set({ profile: { data: null, status: { type: 'loading' } } })
      try {
        const result = await operations.getProfile(active.signal)
        if (active.signal.aborted) return
        if (!result.ok) { set({ profile: { data: null, status: { type: 'failure', failure: result.failure } } }); return }
        const profile = result.data
        set({ profile: { data: profile, status: { type: 'success' } }, name: profile.name, phoneNumber: profile.phoneNumber ?? '', countryCode: profile.countryCode ?? '' })
      } finally { if (controller === active) controller = null }
    },
    saveProfile: async () => {
      if (controller || !get().profile.data) return null
      controller = new AbortController()
      const active = controller
      set({ actionStatus: { type: 'loading', action: 'profile' } })
      try {
        const { name, phoneNumber, countryCode } = get()
        const result = await operations.updateProfile({ name, phoneNumber, countryCode }, active.signal)
        if (active.signal.aborted) return null
        if (!result.ok) { set({ actionStatus: { type: 'failure', action: 'profile', message: result.failure.message } }); return null }
        const profile = get().profile.data
        if (profile) set({ profile: { data: { ...profile, ...result.data }, status: { type: 'success' } }, actionStatus: { type: 'success', action: 'profile' } })
        return result.data.name
      } finally { if (controller === active) controller = null }
    },
    changePassword: async () => {
      if (controller) return false
      controller = new AbortController()
      const active = controller
      set({ actionStatus: { type: 'loading', action: 'password' } })
      try {
        const { currentPassword, newPassword, confirmNewPassword } = get()
        const result = await operations.changePassword({ currentPassword, newPassword, confirmNewPassword }, active.signal)
        if (active.signal.aborted) return false
        set({ currentPassword: '', newPassword: '', confirmNewPassword: '', actionStatus: result.ok ? { type: 'success', action: 'password' } : { type: 'failure', action: 'password', message: result.failure.message } })
        return result.ok
      } finally { if (controller === active) controller = null }
    },
    deactivate: async () => {
      if (controller) return false
      controller = new AbortController()
      const active = controller
      set({ actionStatus: { type: 'loading', action: 'deactivate' } })
      try {
        const result = await operations.deactivateAccount(get().deactivatePassword, active.signal)
        if (active.signal.aborted) return false
        set({ deactivatePassword: '', actionStatus: result.ok ? { type: 'success', action: 'deactivate' } : { type: 'failure', action: 'deactivate', message: result.failure.message } })
        return result.ok
      } finally { if (controller === active) controller = null }
    },
    cancelPending: () => { controller?.abort(); controller = null },
  }))
}

/** Tipe API Zustand yang dihasilkan oleh {@link createAccountStore}. */
export type AccountStoreApi = ReturnType<typeof createAccountStore>
