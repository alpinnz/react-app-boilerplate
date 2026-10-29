/** Kegagalan khusus operasi pengguna yang aman ditampilkan pada UI. */
export type UserFailure =
  | { kind: 'invalidInput'; message: string }
  | { kind: 'notFound'; message: string }
  | { kind: 'unauthorized'; message: string }
  | { kind: 'forbidden'; message: string }
  | { kind: 'conflict'; message: string }
  | { kind: 'network'; message: string }
  | { kind: 'invalidResponse'; message: string }
  | { kind: 'unexpected'; message: string }
