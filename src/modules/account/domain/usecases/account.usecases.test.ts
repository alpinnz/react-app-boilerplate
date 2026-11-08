import { describe, expect, it, vi } from 'vitest'
import type { AccountRepository } from '../repositories/account.repository'
import { createAccountUseCases } from './account.usecases'

function createRepository() {
  return {
    getProfile: vi.fn<AccountRepository['getProfile']>(),
    updateProfile: vi.fn<AccountRepository['updateProfile']>(),
    changePassword: vi.fn<AccountRepository['changePassword']>(),
    deactivateAccount: vi.fn<AccountRepository['deactivateAccount']>(),
  } satisfies AccountRepository
}

describe('account use cases', () => {
  it('given a profile with surrounding whitespace, when updating it, then normalizes fields before saving', async () => {
    const repository = createRepository()
    repository.updateProfile.mockResolvedValue({ ok: true, data: { name: 'Alya', phoneNumber: null, countryCode: 'ID' } })
    const operations = createAccountUseCases(repository)
    const signal = new AbortController().signal

    await operations.updateProfile({ name: ' Alya ', phoneNumber: '  ', countryCode: ' ID ' }, signal)

    expect(repository.updateProfile).toHaveBeenCalledWith({ name: 'Alya', phoneNumber: null, countryCode: 'ID' }, signal)
  })

  it('given an invalid profile, when updating it, then returns field errors without calling the repository', async () => {
    const repository = createRepository()
    const operations = createAccountUseCases(repository)

    await expect(operations.updateProfile({ name: ' ', phoneNumber: '1'.repeat(21), countryCode: 'IDCODE' })).resolves.toMatchObject({
      ok: false,
      failure: { kind: 'invalidInput', fieldErrors: { name: expect.any(String), phoneNumber: expect.any(String), countryCode: expect.any(String) } },
    })
    expect(repository.updateProfile).not.toHaveBeenCalled()
  })

  it('given a mismatched or weak password, when changing it, then rejects it before persistence', async () => {
    const repository = createRepository()
    const operations = createAccountUseCases(repository)

    await expect(operations.changePassword({
      currentPassword: 'Current!123', newPassword: 'weak', confirmNewPassword: 'different',
    })).resolves.toMatchObject({
      ok: false,
      failure: { kind: 'invalidInput', fieldErrors: { newPassword: expect.any(String), confirmNewPassword: expect.any(String) } },
    })
    expect(repository.changePassword).not.toHaveBeenCalled()
  })

  it('given valid password inputs, when changing the password, then forwards the input and signal', async () => {
    const repository = createRepository()
    repository.changePassword.mockResolvedValue({ ok: true, data: null })
    const operations = createAccountUseCases(repository)
    const input = { currentPassword: 'Current!123', newPassword: 'New!Password1', confirmNewPassword: 'New!Password1' }
    const signal = new AbortController().signal

    await operations.changePassword(input, signal)

    expect(repository.changePassword).toHaveBeenCalledWith(input, signal)
  })

  it('given a short current password, when deactivating the account, then rejects it without calling the repository', async () => {
    const repository = createRepository()

    await expect(createAccountUseCases(repository).deactivateAccount('short')).resolves.toMatchObject({
      ok: false,
      failure: { kind: 'invalidInput', fieldErrors: { currentPassword: expect.any(String) } },
    })
    expect(repository.deactivateAccount).not.toHaveBeenCalled()
  })
})
