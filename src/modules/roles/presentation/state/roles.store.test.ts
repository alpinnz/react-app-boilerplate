import { describe, expect, it, vi } from 'vitest'
import type { RoleUseCases } from '../../domain/usecases/role.usecases'
import { createRolesStore } from './roles.store'

const basicRole = { id: 'role-1', name: 'user', level: 10 }

function createOperations() {
  return {
    listRoles: vi.fn<RoleUseCases['listRoles']>().mockResolvedValue({ ok: true, data: [basicRole] }),
    getRole: vi.fn<RoleUseCases['getRole']>().mockResolvedValue({ ok: true, data: basicRole }),
    createRole: vi.fn<RoleUseCases['createRole']>().mockResolvedValue({ ok: true, data: { id: 'role-2', name: 'staff', level: 50 } }),
    updateRole: vi.fn<RoleUseCases['updateRole']>().mockResolvedValue({ ok: true, data: { id: 'role-1', name: 'member', level: 20 } }),
    deleteRole: vi.fn<RoleUseCases['deleteRole']>().mockResolvedValue({ ok: true, data: null }),
  } satisfies RoleUseCases
}

describe('roles store', () => {
  it('given an unloaded catalog, when roles load, then stores the returned roles', async () => {
    const operations = createOperations()
    const store = createRolesStore(operations, 100)
    const loading = store.getState().load()

    expect(store.getState().roles.status.type).toBe('loading')
    await loading

    expect(store.getState().roles).toEqual({ data: [basicRole], status: { type: 'success' } })
  })

  it('given valid create form values, when creating a role, then inserts it by descending level and clears the form', async () => {
    const store = createRolesStore(createOperations(), 100)
    await store.getState().load()
    store.getState().setCreateName('staff')
    store.getState().setCreateLevel('50')

    await store.getState().create()

    expect(store.getState().roles.data).toEqual([
      { id: 'role-2', name: 'staff', level: 50 }, basicRole,
    ])
    expect(store.getState()).toMatchObject({ createName: '', createLevel: '', actionStatus: { type: 'success' } })
  })

  it('given a selected role, when updating it, then replaces the role and keeps the detail selected', async () => {
    const operations = createOperations()
    const store = createRolesStore(operations, 100)
    await store.getState().load()
    await store.getState().select('role-1')
    store.getState().setEditName('member')
    store.getState().setEditLevel('20')

    await store.getState().update()

    expect(store.getState().roles.data).toEqual([{ id: 'role-1', name: 'member', level: 20 }])
    expect(store.getState().selected).toEqual({ id: 'role-1', name: 'member', level: 20 })
    expect(operations.updateRole).toHaveBeenCalledWith('role-1', { name: 'member', level: 20 }, 100, expect.any(AbortSignal))
  })

  it('given a selected role awaiting deletion, when deletion succeeds, then removes it and closes confirmation', async () => {
    const store = createRolesStore(createOperations(), 100)
    await store.getState().load()
    await store.getState().select('role-1')
    store.getState().askDelete()
    expect(store.getState().confirmDelete).toBe(true)

    await store.getState().remove()

    expect(store.getState()).toMatchObject({ roles: { data: [], status: { type: 'noData' } }, selected: null, confirmDelete: false, actionStatus: { type: 'success' } })
  })
})
