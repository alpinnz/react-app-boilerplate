import { HttpError } from '@/infrastructure/http/http-client'
import type { UserFailure } from '../../domain/failures/user.failure'
import type { UserRepository } from '../../domain/repositories/user.repository'
import type { UserRemoteDataSource } from '../datasources/user-remote.datasource'
import { mapUser } from '../mappers/user.mapper'

function toFailure(error: unknown): UserFailure {
  if (error instanceof HttpError) {
    if (error.status === 401) return { kind: 'unauthorized', message: 'Sesi berakhir. Silakan masuk lagi.' }
    if (error.status === 403) return { kind: 'forbidden', message: 'Anda tidak memiliki izin untuk operasi ini.' }
    if (error.status === 404) return { kind: 'notFound', message: 'Pengguna tidak ditemukan.' }
    if (error.status === 409) return { kind: 'conflict', message: 'Perubahan bertentangan dengan data terbaru.' }
    if (error.status === 422 || error.status === 400) return { kind: 'invalidInput', message: 'Data pengguna tidak valid.' }
    if (error.kind === 'network' || error.kind === 'timeout') return { kind: 'network', message: 'Tidak dapat terhubung ke server. Coba lagi.' }
    if (error.kind === 'invalidResponse') return { kind: 'invalidResponse', message: 'Respons server tidak valid.' }
  }
  if (error instanceof Error && error.message === 'invalidResponse') {
    return { kind: 'invalidResponse', message: 'Respons server tidak valid.' }
  }
  return { kind: 'unexpected', message: 'Operasi pengguna gagal. Coba lagi.' }
}

/**
 * Menghubungkan data source API ke kontrak domain dan memetakan kegagalan.
 * Cursor domain dikonversi ke nomor halaman karena kontrak backend memakai page.
 */
export function createUserRepository(remote: UserRemoteDataSource): UserRepository {
  return {
    async getUser(id, signal) {
      try { return { ok: true, data: mapUser(await remote.getUser(id, signal)) } }
      catch (error) { return { ok: false, failure: toFailure(error) } }
    },
    async changeUserRole(userId, roleId, signal) {
      try {
        await remote.changeUserRole(userId, roleId, signal)
        return { ok: true, data: null }
      } catch (error) { return { ok: false, failure: toFailure(error) } }
    },
    async getUsers({ cursor }, signal) {
      try {
        const page = cursor === null ? 1 : Number(cursor)
        if (!Number.isSafeInteger(page) || page < 1 || page > 10000) {
          return { ok: false, failure: { kind: 'invalidInput', message: 'Halaman tidak valid.' } }
        }
        const response = await remote.getUsers(page, signal)
        if (response.page !== page || (response.hasNext && page === 10000)) throw new Error('invalidResponse')
        return {
          ok: true,
          data: { items: response.items.map(mapUser), nextCursor: response.hasNext && response.items.length > 0 ? String(page + 1) : null },
        }
      } catch (error) {
        return { ok: false, failure: toFailure(error) }
      }
    },
    async updateUser(input, signal) {
      try {
        return { ok: true, data: mapUser(await remote.updateUser(input, signal)) }
      } catch (error) {
        return { ok: false, failure: toFailure(error) }
      }
    },
    async deleteUser(id, signal) {
      try {
        await remote.deleteUser(id, signal)
        return { ok: true, data: id }
      } catch (error) {
        return { ok: false, failure: toFailure(error) }
      }
    },
  }
}
