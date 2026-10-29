import { useLocalization } from '@valfuse-node/react'

// Existing domain failures carry Indonesian copy. Keep domain independent of UI
// and translate these known messages at the presentation boundary.
const messageKeys: Record<string, string> = {
  'Data yang dikirim tidak valid.': 'common.errorInvalidInput',
  'Sesi berakhir. Silakan masuk lagi.': 'common.errorUnauthorized',
  'Anda tidak memiliki izin untuk operasi ini.': 'common.errorForbidden',
  'Data tidak ditemukan.': 'common.errorNotFound',
  'Perubahan bertentangan dengan data terbaru.': 'common.errorConflict',
  'Layanan sedang tidak tersedia. Coba lagi nanti.': 'common.errorUnavailable',
  'Tidak dapat terhubung ke server. Coba lagi.': 'common.errorNetwork',
  'Respons server tidak valid.': 'common.errorInvalidResponse',
  'Operasi gagal. Coba lagi.': 'common.errorUnexpected',
  'Pengguna tidak ditemukan.': 'users.errorUserNotFound',
  'Data pengguna tidak valid.': 'users.errorInvalidUser',
  'Operasi pengguna gagal. Coba lagi.': 'users.errorUserOperation',
  'Halaman tidak valid.': 'users.errorInvalidPage',
  'Gagal menghapus pengguna.': 'users.errorDeleteUser',
  'Gagal memuat pengguna.': 'users.errorLoadUsers',
  'Gagal menyimpan pengguna.': 'users.errorSaveUser',
  'Tidak dapat masuk. Coba lagi.': 'auth.errorLogin',
  'Email atau kata sandi tidak cocok.': 'auth.errorCredentials',
  'Terlalu banyak percobaan masuk. Tunggu beberapa saat lalu coba lagi.': 'auth.errorRateLimited',
  'Operasi akun gagal. Coba lagi.': 'account.errorAccountOperation',
  'Konfirmasi kata sandi belum sama.': 'common.errorPasswordMismatch',
  'Gunakan kata sandi 8–72 karakter dengan huruf besar, angka, dan simbol.': 'common.errorWeakPassword',
  'Periksa nama, email, dan nomor telepon yang diisi.': 'auth.errorInvalidRegistration',
  'Isi profil yang valid.': 'account.errorInvalidProfile',
  'Kata sandi baru harus 8–72 karakter, memiliki huruf besar, angka, simbol, dan cocok dengan konfirmasi.': 'account.errorInvalidNewPassword',
  'Masukkan kata sandi akun saat ini.': 'account.errorCurrentPassword',
  'Nama peran harus huruf kecil/angka/garis, dan level harus lebih rendah dari level Anda.': 'roles.errorInvalidRole',
  'Isi nama dan nomor telepon yang valid.': 'users.errorInvalidUserProfile',
}

export function useLocalizedMessage() {
  const { translate } = useLocalization()
  return (message: string) => {
    const key = messageKeys[message]
    return key ? translate(key) : message
  }
}
