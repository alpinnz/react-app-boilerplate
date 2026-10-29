import { createStore } from 'zustand/vanilla'
import { initialDataState, type DataState } from '@/shared/presentation/state/data-state'
import type { OperationFailure } from '@/shared/domain/operation-failure'
import type { Role } from '../../domain/entities/role'
import type { RoleUseCases } from '../../domain/usecases/role.usecases'

type ActionStatus = { type: 'idle' | 'loading' | 'success' } | { type: 'failure'; message: string }

/** Membuat state katalog role dan aksi CRUD yang dibatasi level aktor aktif. */
export function createRolesStore(operations: RoleUseCases, actorLevel: number) {
  let controller: AbortController | null = null
  return createStore<{
    roles: DataState<Role[], OperationFailure>
    selected: Role | null
    createName: string; createLevel: string; editName: string; editLevel: string
    confirmDelete: boolean
    actionStatus: ActionStatus
    setCreateName: (name: string) => void
    setCreateLevel: (level: string) => void
    setEditName: (name: string) => void
    setEditLevel: (level: string) => void
    load: () => Promise<void>
    select: (id: string) => Promise<void>
    closeDetail: () => void
    create: () => Promise<void>
    update: () => Promise<void>
    askDelete: () => void
    cancelDelete: () => void
    remove: () => Promise<void>
    cancelPending: () => void
  }>()((set, get) => ({
    roles: initialDataState(), selected: null,
    createName: '', createLevel: '', editName: '', editLevel: '', confirmDelete: false,
    actionStatus: { type: 'idle' },
    setCreateName: (createName) => set({ createName, actionStatus: { type: 'idle' } }),
    setCreateLevel: (createLevel) => set({ createLevel, actionStatus: { type: 'idle' } }),
    setEditName: (editName) => set({ editName, actionStatus: { type: 'idle' } }),
    setEditLevel: (editLevel) => set({ editLevel, actionStatus: { type: 'idle' } }),
    load: async () => {
      if (controller) return
      controller = new AbortController()
      const active = controller
      set({ roles: { data: get().roles.data, status: { type: 'loading' } } })
      try {
        const result = await operations.listRoles(active.signal)
        if (active.signal.aborted) return
        set({ roles: result.ok ? { data: result.data, status: result.data.length ? { type: 'success' } : { type: 'noData' } } : { data: get().roles.data, status: { type: 'failure', failure: result.failure } } })
      } finally { if (controller === active) controller = null }
    },
    select: async (id) => {
      if (controller) return
      controller = new AbortController()
      const active = controller
      set({ actionStatus: { type: 'loading' } })
      try {
        const result = await operations.getRole(id, active.signal)
        if (active.signal.aborted) return
        if (!result.ok) { set({ actionStatus: { type: 'failure', message: result.failure.message } }); return }
        set({ selected: result.data, editName: result.data.name, editLevel: String(result.data.level), actionStatus: { type: 'idle' } })
      } finally { if (controller === active) controller = null }
    },
    closeDetail: () => set({ selected: null, confirmDelete: false, actionStatus: { type: 'idle' } }),
    create: async () => {
      if (controller) return
      controller = new AbortController()
      const active = controller
      set({ actionStatus: { type: 'loading' } })
      try {
        const result = await operations.createRole({ name: get().createName, level: Number(get().createLevel) }, actorLevel, active.signal)
        if (active.signal.aborted) return
        if (!result.ok) { set({ actionStatus: { type: 'failure', message: result.failure.message } }); return }
        const roles = [...(get().roles.data ?? []), result.data].sort((a, b) => b.level - a.level)
        set({ roles: { data: roles, status: { type: 'success' } }, createName: '', createLevel: '', actionStatus: { type: 'success' } })
      } finally { if (controller === active) controller = null }
    },
    update: async () => {
      const selected = get().selected
      if (controller || !selected) return
      controller = new AbortController()
      const active = controller
      set({ actionStatus: { type: 'loading' } })
      try {
        const result = await operations.updateRole(selected.id, { name: get().editName, level: Number(get().editLevel) }, actorLevel, active.signal)
        if (active.signal.aborted) return
        if (!result.ok) { set({ actionStatus: { type: 'failure', message: result.failure.message } }); return }
        const roles = (get().roles.data ?? []).map((role) => role.id === selected.id ? result.data : role).sort((a, b) => b.level - a.level)
        set({ roles: { data: roles, status: { type: 'success' } }, selected: result.data, actionStatus: { type: 'success' } })
      } finally { if (controller === active) controller = null }
    },
    askDelete: () => set({ confirmDelete: true, actionStatus: { type: 'idle' } }),
    cancelDelete: () => set({ confirmDelete: false, actionStatus: { type: 'idle' } }),
    remove: async () => {
      const selected = get().selected
      if (controller || !selected) return
      controller = new AbortController()
      const active = controller
      set({ actionStatus: { type: 'loading' } })
      try {
        const result = await operations.deleteRole(selected.id, active.signal)
        if (active.signal.aborted) return
        if (!result.ok) { set({ actionStatus: { type: 'failure', message: result.failure.message } }); return }
        const roles = (get().roles.data ?? []).filter((role) => role.id !== selected.id)
        set({ roles: { data: roles, status: roles.length ? { type: 'success' } : { type: 'noData' } }, selected: null, confirmDelete: false, actionStatus: { type: 'success' } })
      } finally { if (controller === active) controller = null }
    },
    cancelPending: () => { controller?.abort(); controller = null },
  }))
}

/** Tipe API Zustand yang dihasilkan oleh {@link createRolesStore}. */
export type RolesStoreApi = ReturnType<typeof createRolesStore>
