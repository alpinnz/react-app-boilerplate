/** Kegagalan operasi yang aman dipetakan ke state dan pesan antarmuka. */
export type OperationFailure = {
  kind: 'invalidInput' | 'unauthorized' | 'forbidden' | 'notFound' | 'conflict' | 'network' | 'invalidResponse' | 'unexpected'
  message: string
}
