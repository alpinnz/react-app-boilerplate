import { describe, expect, it, vi } from 'vitest'
import type { User } from '../../../../domain/entities/user'
import type { UpdateUser } from '../../../../domain/usecases/update-user.usecase'
import { createEditUserStore } from './edit-user.store'

const user: User = { id: 'user-1', name: 'Alya', email: 'alya@example.test', phoneNumber: null, countryCode: null }

describe('edit user store', () => {
  it('given edited form fields, when saving succeeds, then returns the updated user and success status', async () => {
    const updatedUser = { ...user, name: 'Alya Baru' }
    const updateUser = vi.fn<UpdateUser>().mockResolvedValue({ ok: true, data: updatedUser })
    const store = createEditUserStore(user, updateUser)
    store.getState().setName('Alya Baru')

    await expect(store.getState().save()).resolves.toEqual(updatedUser)

    expect(updateUser).toHaveBeenCalledWith({ id: 'user-1', name: 'Alya Baru', phoneNumber: '', countryCode: '' }, expect.any(AbortSignal))
    expect(store.getState().status).toEqual({ type: 'success' })
  })

  it('given a pending save, when another save starts, then avoids a duplicate update request', async () => {
    let completeUpdate!: (result: Awaited<ReturnType<UpdateUser>>) => void
    const updateUser = vi.fn<UpdateUser>().mockReturnValue(new Promise((resolve) => { completeUpdate = resolve }))
    const store = createEditUserStore(user, updateUser)

    const firstSave = store.getState().save()
    await expect(store.getState().save()).resolves.toBeNull()
    completeUpdate({ ok: true, data: { ...user, name: 'Alya' } })
    await firstSave

    expect(updateUser).toHaveBeenCalledOnce()
  })
})
