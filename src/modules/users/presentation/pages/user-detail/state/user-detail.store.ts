import { createStore } from 'zustand/vanilla'
import { initialDataState, type DataState } from '@/shared/presentation/state/data-state'
import type { User } from '@/modules/users/domain/entities/user'
import type { UserFailure } from '@/modules/users/domain/failures/user.failure'
import type { ChangeUserRole } from '@/modules/users/domain/usecases/change-user-role.usecase'
import type { GetUser } from '@/modules/users/domain/usecases/get-user.usecase'
import type { AssignableRole, ListAssignableRoles } from '../assignable-role'

type ActionStatus = { type: 'idle' | 'loading' | 'success' } | { type: 'failure'; message: string }

/**
 * Membuat store detail dengan satu kontrol pembatalan untuk baca dan perubahan peran.
 *
 * @param userId - Identitas pengguna yang menjadi scope store.
 * @param getUser - Operasi domain untuk membaca detail pengguna.
 * @param changeUserRole - Operasi domain untuk memperbarui peran pengguna.
 * @param listAssignableRoles - Operasi untuk memuat pilihan peran aktor.
 * @returns State detail, pilihan peran, tindakan modal, dan cleanup request.
 */
export function createUserDetailStore(userId: string, getUser: GetUser, changeUserRole: ChangeUserRole, listAssignableRoles: ListAssignableRoles) {
  let controller: AbortController | null = null
  return createStore<{
    user: DataState<User, UserFailure>
    roles: AssignableRole[] | null
    rolesError: string | null
    selectedRoleId: string
    actionStatus: ActionStatus
    isEditing: boolean
    isDeleting: boolean
    load: () => Promise<void>
    setSelectedRoleId: (id: string) => void
    assignRole: () => Promise<void>
    openEdit: () => void
    openDelete: () => void
    closeOverlay: () => void
    applySavedUser: (user: User) => void
    cancelPending: () => void
  }>()((set, get) => ({
    user: initialDataState(), roles: null, rolesError: null, selectedRoleId: '',
    actionStatus: { type: 'idle' }, isEditing: false, isDeleting: false,
    load: async () => {
      if (controller) return
      controller = new AbortController()
      const active = controller
      set({ user: { data: get().user.data, status: { type: 'loading' } }, rolesError: null })
      try {
        const [userResult, rolesResult] = await Promise.all([getUser(userId, active.signal), listAssignableRoles(active.signal)])
        if (active.signal.aborted) return
        set({
          user: userResult.ok ? { data: userResult.data, status: { type: 'success' } } : { data: null, status: { type: 'failure', failure: userResult.failure } },
          roles: rolesResult.ok ? rolesResult.data : null,
          rolesError: rolesResult.ok ? null : rolesResult.failure.message,
          selectedRoleId: userResult.ok ? userResult.data.roleId ?? '' : '',
        })
      } finally { if (controller === active) controller = null }
    },
    setSelectedRoleId: (selectedRoleId) => set({ selectedRoleId, actionStatus: { type: 'idle' } }),
    assignRole: async () => {
      const { user, selectedRoleId } = get()
      if (controller || !user.data || !selectedRoleId || selectedRoleId === user.data.roleId) return
      controller = new AbortController()
      const active = controller
      set({ actionStatus: { type: 'loading' } })
      try {
        const result = await changeUserRole(user.data.id, selectedRoleId, active.signal)
        if (active.signal.aborted) return
        if (!result.ok) { set({ actionStatus: { type: 'failure', message: result.failure.message } }); return }
        set({ user: { data: { ...user.data, roleId: selectedRoleId }, status: { type: 'success' } }, actionStatus: { type: 'success' } })
      } finally { if (controller === active) controller = null }
    },
    openEdit: () => set({ isEditing: true, actionStatus: { type: 'idle' } }),
    openDelete: () => set({ isDeleting: true, actionStatus: { type: 'idle' } }),
    closeOverlay: () => set({ isEditing: false, isDeleting: false, actionStatus: { type: 'idle' } }),
    applySavedUser: (user) => set({ user: { data: user, status: { type: 'success' } }, isEditing: false, actionStatus: { type: 'idle' } }),
    cancelPending: () => { controller?.abort(); controller = null },
  }))
}

/** Tipe API Zustand yang dihasilkan oleh {@link createUserDetailStore}. */
export type UserDetailStoreApi = ReturnType<typeof createUserDetailStore>
