/** Hasil operasi domain yang selalu memisahkan data sukses dari kegagalan. */
export type Result<Data, Failure> =
  | { ok: true; data: Data }
  | { ok: false; failure: Failure }
