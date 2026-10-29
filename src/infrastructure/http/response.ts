/** Memastikan nilai asing berbentuk record JSON, bukan array atau null. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Mengambil payload data setelah envelope API dan kode respons tervalidasi. */
export function responseData(payload: unknown, code: 'success' | 'created' | 'updated'): unknown {
  if (!isRecord(payload) || payload.code !== code || !('data' in payload)) throw new Error('invalidResponse')
  return payload.data
}

/** Memvalidasi kode envelope untuk operasi yang tidak mengembalikan data. */
export function assertResponseCode(payload: unknown, code: 'success' | 'deleted' | 'updated'): void {
  if (!isRecord(payload) || payload.code !== code) throw new Error('invalidResponse')
}
