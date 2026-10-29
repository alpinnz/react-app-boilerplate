import type { OperationFailure } from '@/shared/domain/operation-failure'
import { HttpError } from './http-client'

/** Memetakan error transport atau respons ke kegagalan aman untuk UI. */
export function mapOperationFailure(error: unknown): OperationFailure {
  if (error instanceof HttpError) {
    if (error.status === 400 || error.status === 422) return { kind: 'invalidInput', message: 'Data yang dikirim tidak valid.' }
    if (error.status === 401) return { kind: 'unauthorized', message: 'Sesi berakhir. Silakan masuk lagi.' }
    if (error.status === 403) return { kind: 'forbidden', message: 'Anda tidak memiliki izin untuk operasi ini.' }
    if (error.status === 404) return { kind: 'notFound', message: 'Data tidak ditemukan.' }
    if (error.status === 409) return { kind: 'conflict', message: 'Perubahan bertentangan dengan data terbaru.' }
    if (error.status === 429 || error.status === 503) return { kind: 'network', message: 'Layanan sedang tidak tersedia. Coba lagi nanti.' }
    if (error.kind === 'network' || error.kind === 'timeout') return { kind: 'network', message: 'Tidak dapat terhubung ke server. Coba lagi.' }
    if (error.kind === 'invalidResponse') return { kind: 'invalidResponse', message: 'Respons server tidak valid.' }
  }
  if (error instanceof Error && error.message === 'invalidResponse') return { kind: 'invalidResponse', message: 'Respons server tidak valid.' }
  return { kind: 'unexpected', message: 'Operasi gagal. Coba lagi.' }
}
