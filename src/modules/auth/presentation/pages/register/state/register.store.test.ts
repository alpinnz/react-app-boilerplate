import { describe, expect, it, vi } from 'vitest'
import type { RegistrationUseCases } from '../../../../domain/usecases/register.usecase'
import { createRegisterStore } from './register.store'

describe('register store', () => {
  it('given valid form fields, when registration succeeds, then clears passwords and locks duplicate submission', async () => {
    const register = vi.fn<RegistrationUseCases['register']>().mockResolvedValue({ ok: true, data: 'user-1' })
    const store = createRegisterStore(register)
    store.getState().setField('name', 'Alya')
    store.getState().setField('email', 'alya@example.test')
    store.getState().setField('password', 'Valid!Password1')
    store.getState().setField('confirmPassword', 'Valid!Password1')

    await store.getState().submit()
    await store.getState().submit()

    expect(register).toHaveBeenCalledOnce()
    expect(store.getState()).toMatchObject({
      status: { type: 'success' }, password: '', confirmPassword: '',
    })
  })

  it('given a validation failure, when a field changes, then clears the error so the form can be retried', async () => {
    const register = vi.fn<RegistrationUseCases['register']>()
      .mockResolvedValueOnce({ ok: false, failure: { kind: 'invalidInput', message: 'Periksa email.', fieldErrors: { email: 'Tidak valid.' } } })
      .mockResolvedValueOnce({ ok: true, data: 'user-1' })
    const store = createRegisterStore(register)

    await store.getState().submit()
    expect(store.getState().status).toMatchObject({ type: 'failure', fieldErrors: { email: 'Tidak valid.' } })

    store.getState().setField('email', 'alya@example.test')
    expect(store.getState().status).toEqual({ type: 'idle' })
    await store.getState().submit()
    expect(store.getState().status).toEqual({ type: 'success' })
  })
})
