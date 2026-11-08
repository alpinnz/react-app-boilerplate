import { describe, expect, it, vi } from 'vitest'
import type { UserRepository } from '../repositories/user.repository'
import { createUpdateUser } from './update-user.usecase'

function createRepository() {
  return {
    getUsers: vi.fn<UserRepository['getUsers']>(),
    getUser: vi.fn<UserRepository['getUser']>(),
    changeUserRole: vi.fn<UserRepository['changeUserRole']>(),
    updateUser: vi.fn<UserRepository['updateUser']>(),
    deleteUser: vi.fn<UserRepository['deleteUser']>(),
  } satisfies UserRepository
}

describe('update user use case', () => {
  it('given a valid user update, when saving it, then trims text and converts blank optional fields to null', async () => {
    const repository = createRepository()
    repository.updateUser.mockResolvedValue({ ok: true, data: {
      id: 'user-1', name: 'Alya Baru', email: 'alya@example.test', phoneNumber: null, countryCode: null,
    } })
    const signal = new AbortController().signal

    await createUpdateUser(repository)({ id: 'user-1', name: ' Alya Baru ', phoneNumber: '  ', countryCode: '  ' }, signal)

    expect(repository.updateUser).toHaveBeenCalledWith({ id: 'user-1', name: 'Alya Baru', phoneNumber: null, countryCode: null }, signal)
  })

  it('given invalid id or profile fields, when saving the user, then returns field errors without calling the repository', async () => {
    const repository = createRepository()
    const updateUser = createUpdateUser(repository)

    await expect(updateUser({ id: '', name: ' ', phoneNumber: '1'.repeat(21), countryCode: 'IDCODE' })).resolves.toMatchObject({
      ok: false,
      failure: { kind: 'invalidInput', fieldErrors: { name: expect.any(String), phoneNumber: expect.any(String), countryCode: expect.any(String) } },
    })
    expect(repository.updateUser).not.toHaveBeenCalled()
  })
})
