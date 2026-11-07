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
      const fieldErrors: Record<string, string> = {}
      if (!name || name.length > 100) fieldErrors.name = 'Nama wajib diisi dan maksimal 100 karakter.'
      if ((phoneNumber?.length ?? 0) > 20) fieldErrors.phoneNumber = 'Nomor telepon maksimal 20 karakter.'
      if ((countryCode?.length ?? 0) > 5) fieldErrors.countryCode = 'Kode negara maksimal 5 karakter.'
      if (Object.keys(fieldErrors).length) {
        return Promise.resolve({ ok: false as const, failure: { kind: 'invalidInput' as const, message: 'Isi profil yang valid.', fieldErrors } })
      }
      return repository.updateProfile({ name, phoneNumber, countryCode }, signal)
    },
    changePassword: (input: ChangePasswordInput, signal?: AbortSignal) => {
      const fieldErrors: Record<string, string> = {}
      if (input.currentPassword.length < 8 || input.currentPassword.length > 72) fieldErrors.currentPassword = 'Kata sandi saat ini wajib diisi dengan 8–72 karakter.'
      if (!passwordPattern.test(input.newPassword)) fieldErrors.newPassword = 'Kata sandi harus 8–72 karakter, berisi huruf besar, angka, dan simbol.'
      if (input.newPassword !== input.confirmNewPassword) fieldErrors.confirmNewPassword = 'Konfirmasi kata sandi belum sama.'
      if (Object.keys(fieldErrors).length) {
        return Promise.resolve({ ok: false as const, failure: { kind: 'invalidInput' as const, message: 'Periksa kembali kolom kata sandi.', fieldErrors } })
      }
      return repository.changePassword(input, signal)
    },
    deactivateAccount: (currentPassword: string, signal?: AbortSignal) => {
      if (currentPassword.length < 8 || currentPassword.length > 72) {
        return Promise.resolve({ ok: false as const, failure: { kind: 'invalidInput' as const, message: 'Masukkan kata sandi akun saat ini.', fieldErrors: { currentPassword: 'Kata sandi saat ini wajib diisi dengan 8–72 karakter.' } } })
      }
      return repository.deactivateAccount(currentPassword, signal)
    },
  }
}

/** Account operations consumed by the profile page and route composition. */
export type AccountUseCases = ReturnType<typeof createAccountUseCases>
