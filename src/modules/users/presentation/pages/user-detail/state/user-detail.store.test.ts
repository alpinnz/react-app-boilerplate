import { describe, expect, it, vi } from 'vitest'
import type { User } from '@/modules/users/domain/entities/user'
import type { ChangeUserRole } from '@/modules/users/domain/usecases/change-user-role.usecase'
import type { GetUser } from '@/modules/users/domain/usecases/get-user.usecase'
import type { ListAssignableRoles } from '../assignable-role'
import { createUserDetailStore } from './user-detail.store'

const user: User = {
  id: 'user-1', roleId: 'role-1', name: 'Alya', email: 'alya@example.test', phoneNumber: null, countryCode: null,
}

function createStoreOperations() {
  return {
    getUser: vi.fn<GetUser>().mockResolvedValue({ ok: true, data: user }),
    changeUserRole: vi.fn<ChangeUserRole>().mockResolvedValue({ ok: true, data: null }),
    listAssignableRoles: vi.fn<ListAssignableRoles>().mockResolvedValue({
      ok: true, data: [{ id: 'role-1', name: 'user', level: 10 }, { id: 'role-2', name: 'staff', level: 50 }],
    }),
  }
}

describe('user detail action feedback', () => {
  it('given role action feedback, when another user action starts or completes, then clears the feedback', async () => {
    const operations = createStoreOperations()
    const store = createUserDetailStore(
      user.id,
      operations.getUser,
      operations.changeUserRole,
      operations.listAssignableRoles,
    )

    await store.getState().load()
    store.getState().setSelectedRoleId('role-2')
    await store.getState().assignRole()
    expect(store.getState().actionStatus.type).toBe('success')

    store.getState().openEdit()
    expect(store.getState().actionStatus.type).toBe('idle')

    store.getState().applySavedUser({ ...user, roleId: 'role-2', name: 'Alya Baru' })
    expect(store.getState().actionStatus.type).toBe('idle')
  })

  it('given a user detail request, when loading succeeds, then selects the current role and available options', async () => {
    const operations = createStoreOperations()
    const store = createUserDetailStore(user.id, operations.getUser, operations.changeUserRole, operations.listAssignableRoles)

    await store.getState().load()

    expect(store.getState().user.data).toEqual(user)
    expect(store.getState().roles).toEqual([
      { id: 'role-1', name: 'user', level: 10 }, { id: 'role-2', name: 'staff', level: 50 },
    ])
    expect(store.getState().selectedRoleId).toBe('role-1')
  })

  it('given another assignable role, when assignment succeeds, then updates the user role', async () => {
    const operations = createStoreOperations()
    const store = createUserDetailStore(user.id, operations.getUser, operations.changeUserRole, operations.listAssignableRoles)
    await store.getState().load()
    store.getState().setSelectedRoleId('role-2')

    await store.getState().assignRole()

    expect(operations.changeUserRole).toHaveBeenCalledWith('user-1', 'role-2', expect.any(AbortSignal))
    expect(store.getState().user.data?.roleId).toBe('role-2')
    expect(store.getState().actionStatus).toEqual({ type: 'success' })
  })

  it('given the current role is selected, when assigning a role, then skips the redundant operation', async () => {
    const operations = createStoreOperations()
    const store = createUserDetailStore(user.id, operations.getUser, operations.changeUserRole, operations.listAssignableRoles)
    await store.getState().load()

    await store.getState().assignRole()

    expect(operations.changeUserRole).not.toHaveBeenCalled()
  })
})
