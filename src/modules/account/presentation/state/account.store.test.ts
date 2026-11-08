import { describe, expect, it, vi } from 'vitest'
import type { AccountProfile } from '../../domain/entities/account-profile'
import type { AccountUseCases } from '../../domain/usecases/account.usecases'
import { createAccountStore } from './account.store'

const profile: AccountProfile = {
  id: 'account-1', name: 'Alya', email: 'alya@example.test', phoneNumber: null, countryCode: null,
  role: { id: 'role-1', name: 'owner', level: 100 },
}

function createOperations() {
  return {
    getProfile: vi.fn<AccountUseCases['getProfile']>().mockResolvedValue({ ok: true, data: profile }),
    updateProfile: vi.fn<AccountUseCases['updateProfile']>().mockResolvedValue({
      ok: true, data: { name: 'Alya Baru', phoneNumber: '+628123456789', countryCode: 'ID' },
    }),
    changePassword: vi.fn<AccountUseCases['changePassword']>().mockResolvedValue({ ok: true, data: null }),
    deactivateAccount: vi.fn<AccountUseCases['deactivateAccount']>().mockResolvedValue({ ok: true, data: null }),
  } satisfies AccountUseCases
}

describe('account store', () => {
  it('given an unloaded store, when loading the profile, then fills the profile form', async () => {
    const operations = createOperations()
    const store = createAccountStore(operations)
    const loading = store.getState().load()

    expect(store.getState().profile.status.type).toBe('loading')
    await loading

    expect(store.getState().profile).toEqual({ data: profile, status: { type: 'success' } })
    expect(store.getState()).toMatchObject({ name: 'Alya', phoneNumber: '', countryCode: '' })
  })

  it('given a loaded profile, when saving edits, then updates the profile and reports success', async () => {
    const operations = createOperations()
    const store = createAccountStore(operations)
    await store.getState().load()
    store.getState().setField('name', 'Alya Baru')
    store.getState().setField('phoneNumber', '+628123456789')

    await expect(store.getState().saveProfile()).resolves.toBe('Alya Baru')

    expect(store.getState().profile.data).toMatchObject({ name: 'Alya Baru', phoneNumber: '+628123456789', countryCode: 'ID' })
    expect(store.getState().actionStatus).toEqual({ type: 'success', action: 'profile' })
  })

  it('given successful password and deactivation operations, when submitting them, then clears sensitive form fields', async () => {
    const store = createAccountStore(createOperations())
    store.getState().setField('currentPassword', 'Current!123')
    store.getState().setField('newPassword', 'New!Password1')
    store.getState().setField('confirmNewPassword', 'New!Password1')

    await expect(store.getState().changePassword()).resolves.toBe(true)
    expect(store.getState()).toMatchObject({ currentPassword: '', newPassword: '', confirmNewPassword: '' })

    store.getState().setField('deactivatePassword', 'Current!123')
    await expect(store.getState().deactivate()).resolves.toBe(true)
    expect(store.getState().deactivatePassword).toBe('')
  })

  it('given a rejected profile update, when saving edits, then retains profile data and exposes the field failure', async () => {
    const operations = createOperations()
    operations.updateProfile.mockResolvedValue({
      ok: false, failure: { kind: 'invalidInput', message: 'Periksa profil.', fieldErrors: { name: 'Wajib diisi.' } },
    })
    const store = createAccountStore(operations)
    await store.getState().load()
    store.getState().setField('name', '')

    await expect(store.getState().saveProfile()).resolves.toBeNull()

    expect(store.getState().profile.data).toEqual(profile)
    expect(store.getState().actionStatus).toEqual({
      type: 'failure', action: 'profile', message: 'Periksa profil.', fieldErrors: { name: 'Wajib diisi.' },
    })
  })
})
