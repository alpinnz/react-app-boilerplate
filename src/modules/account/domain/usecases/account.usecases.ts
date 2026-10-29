import type { AccountRepository, AccountProfileInput, ChangePasswordInput } from '../repositories/account.repository'

const passwordPattern = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9\s]).{8,72}$/

/**
 * Membuat operasi akun dan memvalidasi input sebelum memanggil repository.
 *
 * @param repository - Batas domain untuk akses profil dan perubahan akun.
 * @returns Operasi baca profil, ubah profil, ganti kata sandi, dan nonaktifkan akun.
 */
export function createAccountUseCases(repository: AccountRepository) {
  return {
    getProfile: (signal?: AbortSignal) => repository.getProfile(signal),
    updateProfile: (input: AccountProfileInput, signal?: AbortSignal) => {
      const name = input.name.trim()
      const phoneNumber = input.phoneNumber?.trim() || null
      const countryCode = input.countryCode?.trim() || null
      if (!name || name.length > 100 || (phoneNumber?.length ?? 0) > 20 || (countryCode?.length ?? 0) > 5) {
        return Promise.resolve({ ok: false as const, failure: { kind: 'invalidInput' as const, message: 'Isi profil yang valid.' } })
      }
      return repository.updateProfile({ name, phoneNumber, countryCode }, signal)
    },
    changePassword: (input: ChangePasswordInput, signal?: AbortSignal) => {
      if (input.currentPassword.length < 8 || input.currentPassword.length > 72 || !passwordPattern.test(input.newPassword) || input.newPassword !== input.confirmNewPassword) {
        return Promise.resolve({ ok: false as const, failure: { kind: 'invalidInput' as const, message: 'Kata sandi baru harus 8–72 karakter, memiliki huruf besar, angka, simbol, dan cocok dengan konfirmasi.' } })
      }
      return repository.changePassword(input, signal)
    },
    deactivateAccount: (currentPassword: string, signal?: AbortSignal) => {
      if (currentPassword.length < 8 || currentPassword.length > 72) {
        return Promise.resolve({ ok: false as const, failure: { kind: 'invalidInput' as const, message: 'Masukkan kata sandi akun saat ini.' } })
      }
      return repository.deactivateAccount(currentPassword, signal)
    },
  }
}

/** Account operations consumed by the profile page and route composition. */
export type AccountUseCases = ReturnType<typeof createAccountUseCases>
