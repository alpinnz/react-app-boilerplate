import { createStore } from 'zustand/vanilla'
import { initialDataState, type DataState } from '@/shared/presentation/state/data-state'
import type { Session } from '../../../domain/entities/session'
import type { AuthFailure } from '../../../domain/failures/auth.failure'
import type { Login } from '../../../domain/usecases/login.usecase'
import type { Logout } from '../../../domain/usecases/logout.usecase'

/** State autentikasi bersama dan aksi yang mengubah siklus hidup session. */
export type SessionStore = {
  session: DataState<Session, AuthFailure>
  login: (email: string, password: string, rememberMe: boolean) => Promise<boolean>
  logout: () => Promise<void>
  invalidate: () => void
  rename: (name: string) => void
  cancelPending: () => void
}

/** Membuat store session; nomor urut menjaga respons lama tidak memulihkan session usang. */
export function createSessionStore(dependencies: { login: Login; logout: Logout }) {
  let controller: AbortController | null = null
  let sequence = 0

  return createStore<SessionStore>()((set) => ({
    session: initialDataState(),
    login: async (email, password, rememberMe) => {
      if (controller) return false
      controller = new AbortController()
      const activeController = controller
      const requestId = ++sequence
      set({ session: { data: null, status: { type: 'loading' } } })
      try {
        const result = await dependencies.login({ email, password, rememberMe }, activeController.signal)
        if (requestId !== sequence || activeController.signal.aborted) return false
        if (!result.ok) {
          set({ session: { data: null, status: { type: 'failure', failure: result.failure } } })
          return false
        }
        set({ session: { data: result.data, status: { type: 'success' } } })
        return true
      } catch {
        if (requestId !== sequence || activeController.signal.aborted) return false
        set({ session: { data: null, status: { type: 'failure', failure: { kind: 'unexpected', message: 'Tidak dapat masuk. Coba lagi.' } } } })
        return false
      } finally {
        if (requestId === sequence) controller = null
      }
    },
    logout: async () => {
      const logoutId = ++sequence
      controller?.abort()
      controller = null
      // Session lokal dihapus sebelum request jaringan agar UI langsung terkunci.
      set({ session: initialDataState() })
      const result = await dependencies.logout()
      if (!result.ok && logoutId === sequence) {
        set({ session: { data: null, status: { type: 'failure', failure: result.failure } } })
      }
    },
    invalidate: () => {
      ++sequence
      controller?.abort()
      controller = null
      set({ session: initialDataState() })
    },
    rename: (name) => set((state) => state.session.data ? {
      session: { ...state.session, data: { ...state.session.data, name } },
    } : state),
    cancelPending: () => {
      ++sequence
      controller?.abort()
      controller = null
    },
  }))
}

/** Tipe API Zustand yang dihasilkan oleh {@link createSessionStore}. */
export type SessionStoreApi = ReturnType<typeof createSessionStore>
