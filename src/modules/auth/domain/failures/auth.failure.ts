/** Kegagalan autentikasi yang dapat ditampilkan tanpa mengekspos detail transport. */
export type AuthFailure = {
  kind: 'invalidCredentials' | 'unauthorized' | 'rateLimited' | 'network' | 'invalidResponse' | 'unexpected'
  message: string
}
