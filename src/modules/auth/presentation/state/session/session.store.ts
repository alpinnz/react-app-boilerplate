import { createStore } from 'zustand/vanilla'
import { initialDataState, type DataState } from '@/shared/presentation/state/data-state'
import type { Session } from '../../../domain/entities/session'
import type { AuthFailure } from '../../../domain/failures/auth.failure'
import type { Login } from '../../../domain/usecases/login.usecase'
import type { Logout } from '../../../domain/usecases/logout.usecase'
import type { RestoreSession } from '../../../domain/usecases/restore-session.usecase'

/** State autentikasi bersama dan aksi yang mengubah siklus hidup session. */
export type SessionStore = {
  session: DataState<Session, AuthFailure>
  login: (email: string, password: string, rememberMe: boolean) => Promise<boolean>
  restoreSession?: () => Promise<void>
  logout: () => Promise<AuthFailure | null>
  invalidate: () => void
  rename: (name: string) => void
  cancelPending: () => void
}

/** Membuat store session; nomor urut menjaga respons lama tidak memulihkan session usang. */
export function createSessionStore(dependencies: { login: Login; logout: Logout; restoreSession?: RestoreSession }) {
  let controller: AbortController | null = null
  let sequence = 0

  return createStore<SessionStore>()((set) => ({
    session: dependencies.restoreSession ? { data: null, status: { type: 'loading' } } : initialDataState(),
    restoreSession: async () => {
      if (!dependencies.restoreSession) {
        set({ session: initialDataState() })
        return
      }
      if (controller) return
      controller = new AbortController()
      const activeController = controller
      const requestId = ++sequence
      set({ session: { data: null, status: { type: 'loading' } } })
      try {
        const restoredSession = await dependencies.restoreSession(activeController.signal)
        if (requestId !== sequence || activeController.signal.aborted) return
        if (restoredSession === null || (!restoredSession.ok && restoredSession.failure.kind === 'unauthorized')) {
          set({ session: initialDataState() })
          return
        }
        if (!restoredSession.ok) {
          set({ session: { data: null, status: { type: 'failure', failure: restoredSession.failure } } })
          return
        }
        set({ session: { data: restoredSession.data, status: { type: 'success' } } })
      } catch {
        if (requestId !== sequence || activeController.signal.aborted) return
        set({ session: { data: null, status: { type: 'failure', failure: { kind: 'unexpected', message: 'Sesi tidak dapat dipulihkan. Coba lagi.' } } } })
      } finally {
        if (requestId === sequence) controller = null
      }
    },
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
      try {
        const result = await dependencies.logout()
        if (result.ok) return null
        if (logoutId === sequence) {
          set({ session: { data: null, status: { type: 'failure', failure: result.failure } } })
        }
        return result.failure
      } catch {
        const failure: AuthFailure = { kind: 'unexpected', message: 'Gagal keluar. Coba lagi.' }
        if (logoutId === sequence) {
          set({ session: { data: null, status: { type: 'failure', failure } } })
        }
        return failure
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
