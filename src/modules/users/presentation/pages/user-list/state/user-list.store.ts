import { createStore } from 'zustand/vanilla'
import type { Page } from '@/shared/domain/page'
import { initialDataState, type DataState } from '@/shared/presentation/state/data-state'
import type { User } from '@/modules/users/domain/entities/user'
import type { UserFailure } from '@/modules/users/domain/failures/user.failure'
import type { GetUsers } from '@/modules/users/domain/usecases/get-users.usecase'
import type { UserFilter } from '@/modules/users/domain/values/user-filter'

type Mode = 'replace' | 'refresh' | 'append'

/** State dan tindakan UI untuk daftar pengguna, filter, dan overlay per user. */
export type UserListStore = {
  users: DataState<Page<User>, UserFailure>
  filter: UserFilter
  editingUser: User | null
  deletingUser: User | null
  fetchUsers: () => Promise<void>
  refreshUsers: () => Promise<void>
  loadMoreUsers: () => Promise<void>
  setFilter: (filter: UserFilter) => Promise<void>
  openEdit: (user: User) => void
  openDelete: (user: User) => void
  closeOverlay: () => void
  cancelPending: () => void
}

function mergeUsers(previous: User[], incoming: User[]): User[] {
  // Halaman cursor dapat mengulang ID; Map mempertahankan satu record terbaru per ID.
  const users = new Map(previous.map((user) => [user.id, user]))
  for (const user of incoming) users.set(user.id, user)
  return [...users.values()]
}

/**
 * Membuat store daftar yang terisolasi untuk satu halaman.
 * Request lama dibatalkan/diabaikan agar hasil filter sebelumnya tidak menimpa state baru.
 *
 * @param getUsers - Operasi domain untuk memuat halaman pengguna.
 * @returns Store beserta aksi pagination, filter, overlay, dan pembatalan request.
 */
export function createUserListStore(getUsers: GetUsers) {
  let sequence = 0
  let activeController: AbortController | null = null

  return createStore<UserListStore>()((set, get) => {
    async function request(mode: Mode): Promise<void> {
      const snapshot = get()
      const previous = snapshot.users.data
      if (mode === 'append' && (activeController || !previous?.nextCursor)) return

      activeController?.abort()
      const controller = new AbortController()
      activeController = controller
      const requestId = ++sequence
      const cursor = mode === 'append' ? previous!.nextCursor : null

      set({
        users: {
          data: mode === 'replace' ? null : previous,
          status: { type: mode === 'append' ? 'loadMore' : mode === 'refresh' ? 'refreshing' : 'loading' },
        },
      })

      try {
        const result = await getUsers({ cursor }, controller.signal)
        if (requestId !== sequence || controller.signal.aborted) return

        if (!result.ok) {
          set((state) => ({ users: { data: state.users.data, status: { type: 'failure', failure: result.failure } } }))
          return
        }

        const page: Page<User> = {
          ...result.data,
          items: mergeUsers(mode === 'append' && previous ? previous.items : [], result.data.items),
        }
        set({ users: { data: page, status: { type: page.items.length ? 'success' : 'noData' } } })
      } catch {
        if (requestId !== sequence || controller.signal.aborted) return
        set((state) => ({
          users: { data: state.users.data, status: { type: 'failure', failure: { kind: 'unexpected', message: 'Gagal memuat pengguna.' } } },
        }))
      } finally {
        if (requestId === sequence) activeController = null
      }
    }

    return {
      users: initialDataState(),
      filter: { search: '' },
      editingUser: null,
      deletingUser: null,
      fetchUsers: () => request('replace'),
      refreshUsers: () => request('refresh'),
      loadMoreUsers: () => request('append'),
      setFilter: async (filter) => {
        set({ filter: { ...filter } })
      },
      openEdit: (user) => set({ editingUser: user, deletingUser: null }),
      openDelete: (user) => set({ deletingUser: user, editingUser: null }),
      closeOverlay: () => set({ editingUser: null, deletingUser: null }),
      cancelPending: () => {
        ++sequence
        activeController?.abort()
        activeController = null
        set((state) => ({
          users: {
            data: state.users.data,
            status: state.users.data === null
              ? { type: 'initial' }
              : { type: state.users.data.items.length ? 'success' : 'noData' },
          },
        }))
      },
    }
  })
}

/** Tipe API Zustand yang dihasilkan oleh {@link createUserListStore}. */
export type UserListStoreApi = ReturnType<typeof createUserListStore>
