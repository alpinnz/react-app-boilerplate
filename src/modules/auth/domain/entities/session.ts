/** Identitas dan peran pengguna yang telah berhasil diautentikasi. */
export type Session = {
  userId: string
  name: string
  email: string
  role: { name: string; level: number }
}
