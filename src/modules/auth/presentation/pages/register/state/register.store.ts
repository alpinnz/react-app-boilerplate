import { createStore } from 'zustand/vanilla'
import type { RegistrationInput } from '@/modules/auth/domain/repositories/registration.repository'
import type { RegistrationUseCases } from '@/modules/auth/domain/usecases/register.usecase'

type Status = { type: 'idle' | 'loading' | 'success' } | { type: 'failure'; message: string }

/** Membuat state form registrasi per halaman dan membatasi submit berulang. */
export function createRegisterStore(register: RegistrationUseCases['register']) {
  let controller: AbortController | null = null
  return createStore<RegistrationInput & {
    status: Status
    setField: (field: keyof RegistrationInput, value: string) => void
    submit: () => Promise<void>
    cancelPending: () => void
  }>()((set, get) => ({
    name: '', email: '', phoneNumber: null, countryCode: null, password: '', confirmPassword: '',
    status: { type: 'idle' },
    setField: (field, value) => set({ [field]: value, status: { type: 'idle' } }),
    submit: async () => {
      if (controller || get().status.type === 'success') return
      controller = new AbortController()
      const active = controller
      set({ status: { type: 'loading' } })
      const { name, email, phoneNumber, countryCode, password, confirmPassword } = get()
      try {
        const result = await register({ name, email, phoneNumber, countryCode, password, confirmPassword }, active.signal)
        if (active.signal.aborted) return
        set(result.ok
          ? { status: { type: 'success' }, password: '', confirmPassword: '' }
          : { status: { type: 'failure', message: result.failure.message } })
      } finally { if (controller === active) controller = null }
    },
    cancelPending: () => { controller?.abort(); controller = null },
  }))
}

/** Tipe API Zustand yang dihasilkan oleh {@link createRegisterStore}. */
export type RegisterStoreApi = ReturnType<typeof createRegisterStore>
