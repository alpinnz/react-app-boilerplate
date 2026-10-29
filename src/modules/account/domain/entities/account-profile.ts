/** Profil akun dan peran yang ditampilkan pada pengaturan akun. */
export type AccountProfile = {
  id: string
  name: string
  email: string
  phoneNumber: string | null
  countryCode: string | null
  role: { id: string; name: string; level: number }
}
