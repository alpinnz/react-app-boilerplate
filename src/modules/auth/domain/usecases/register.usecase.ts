import type { RegistrationInput, RegistrationRepository } from '../repositories/registration.repository'

const passwordPattern = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9\s]).{8,72}$/

/**
 * Membuat operasi registrasi dengan normalisasi input dan validasi kebijakan akun.
 *
 * @param repository - Kontrak domain untuk registrasi atau membuat user.
 * @returns Operasi registrasi mandiri dan pembuatan user oleh admin.
 */
export function createRegistrationUseCases(repository: RegistrationRepository) {
  function submit(input: RegistrationInput, operation: 'register' | 'createUser', signal?: AbortSignal) {
    const normalized = {
      ...input, name: input.name.trim(), email: input.email.trim().toLowerCase(),
      phoneNumber: input.phoneNumber?.trim() || null, countryCode: input.countryCode?.trim() || null,
    }
    if (input.password !== input.confirmPassword) {
      return Promise.resolve({ ok: false as const, failure: { kind: 'invalidInput' as const, message: 'Konfirmasi kata sandi belum sama.' } })
    }
    if (!passwordPattern.test(input.password)) {
      return Promise.resolve({ ok: false as const, failure: { kind: 'invalidInput' as const, message: 'Gunakan kata sandi 8–72 karakter dengan huruf besar, angka, dan simbol.' } })
    }
    if (!normalized.name || normalized.name.length > 100 || !normalized.email.includes('@') || normalized.email.length > 254 ||
      (normalized.phoneNumber?.length ?? 0) > 20 || (normalized.countryCode?.length ?? 0) > 5) {
      return Promise.resolve({ ok: false as const, failure: { kind: 'invalidInput' as const, message: 'Periksa nama, email, dan nomor telepon yang diisi.' } })
    }
    return repository[operation](normalized, signal)
  }
  return {
    register: (input: RegistrationInput, signal?: AbortSignal) => submit(input, 'register', signal),
    createUser: (input: RegistrationInput, signal?: AbortSignal) => submit(input, 'createUser', signal),
  }
}

/** Registration operations shared by sign-up and user administration flows. */
export type RegistrationUseCases = ReturnType<typeof createRegistrationUseCases>
