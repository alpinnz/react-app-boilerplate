import { describe, expect, it, vi } from 'vitest'
import type { DeleteUser } from '../../../../domain/usecases/delete-user.usecase'
import { createDeleteUserStore } from './delete-user.store'

describe('delete user store', () => {
  it('given a valid user id, when deletion succeeds, then returns the id and records success', async () => {
    const deleteUser = vi.fn<DeleteUser>().mockResolvedValue({ ok: true, data: 'user-1' })
    const store = createDeleteUserStore('user-1', deleteUser)

    await expect(store.getState().remove()).resolves.toBe('user-1')

    expect(deleteUser).toHaveBeenCalledWith('user-1', expect.any(AbortSignal))
    expect(store.getState().status).toEqual({ type: 'success' })
  })

  it('given a failed delete operation, when deletion completes, then returns no id and exposes the failure', async () => {
    const deleteUser = vi.fn<DeleteUser>().mockResolvedValue({
      ok: false, failure: { kind: 'forbidden', message: 'Tidak diizinkan.' },
    })
    const store = createDeleteUserStore('user-1', deleteUser)

    await expect(store.getState().remove()).resolves.toBeNull()

    expect(store.getState().status).toEqual({ type: 'failure', failure: { kind: 'forbidden', message: 'Tidak diizinkan.' } })
  })
})
