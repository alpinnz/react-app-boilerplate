import { describe, expect, it, vi } from 'vitest'
import { createUserDetailStore } from './user-detail.store'

describe('user detail action feedback', () => {
  it('clears role feedback when another user action starts or completes', async () => {
    const user = {
      id: 'user-1', roleId: 'role-1', name: 'Alya', email: 'alya@example.test',
      phoneNumber: null, countryCode: null,
    }
    const store = createUserDetailStore(
      user.id,
      vi.fn().mockResolvedValue({ ok: true, data: user }),
      vi.fn().mockResolvedValue({ ok: true, data: null }),
      vi.fn().mockResolvedValue({ ok: true, data: [
        { id: 'role-1', name: 'user', level: 10 },
        { id: 'role-2', name: 'staff', level: 50 },
      ] }),
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
})
