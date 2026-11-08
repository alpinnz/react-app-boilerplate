import { describe, expect, it, vi } from 'vitest'
import type { RegistrationRepository } from '../repositories/registration.repository'
import { createRegistrationUseCases } from './register.usecase'

function createRepository() {
  return {
    register: vi.fn<RegistrationRepository['register']>(),
    createUser: vi.fn<RegistrationRepository['createUser']>(),
  } satisfies RegistrationRepository
}

const validInput = {
  name: ' Alya ', email: ' ALYA@EXAMPLE.TEST ', phoneNumber: '  ', countryCode: ' ID ',
  password: 'Valid!Password1', confirmPassword: 'Valid!Password1',
}

describe('registration use cases', () => {
  it('given valid registration details, when registering, then normalizes data and forwards the signal', async () => {
    const repository = createRepository()
    repository.register.mockResolvedValue({ ok: true, data: 'user-1' })
    const signal = new AbortController().signal

    await createRegistrationUseCases(repository).register(validInput, signal)

    expect(repository.register).toHaveBeenCalledWith({
      ...validInput, name: 'Alya', email: 'alya@example.test', phoneNumber: null, countryCode: 'ID',
    }, signal)
  })

  it('given valid admin-created user details, when creating a user, then calls the matching repository operation', async () => {
    const repository = createRepository()
    repository.createUser.mockResolvedValue({ ok: true, data: 'user-1' })

    await createRegistrationUseCases(repository).createUser(validInput)

    expect(repository.createUser).toHaveBeenCalledOnce()
    expect(repository.register).not.toHaveBeenCalled()
  })

  it.each([
    [{ ...validInput, confirmPassword: 'Other!Password1' }, 'confirmPassword'],
    [{ ...validInput, password: 'weak', confirmPassword: 'weak' }, 'password'],
    [{ ...validInput, name: ' ' }, 'name'],
    [{ ...validInput, email: 'not-an-email' }, 'email'],
    [{ ...validInput, phoneNumber: '1'.repeat(21) }, 'phoneNumber'],
    [{ ...validInput, countryCode: 'IDCODE' }, 'countryCode'],
  ] as const)('given invalid registration details, when submitting, then reports a field validation error', async (input, field) => {
    const repository = createRepository()

    await expect(createRegistrationUseCases(repository).register(input)).resolves.toMatchObject({
      ok: false,
      failure: { kind: 'invalidInput', fieldErrors: { [field]: expect.any(String) } },
    })
    expect(repository.register).not.toHaveBeenCalled()
  })
})
