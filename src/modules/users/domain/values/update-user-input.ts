/** Field profil yang boleh diubah beserta identitas pengguna target. */
export type UpdateUserInput = {
  id: string
  name: string
  phoneNumber: string | null
  countryCode: string | null
}
