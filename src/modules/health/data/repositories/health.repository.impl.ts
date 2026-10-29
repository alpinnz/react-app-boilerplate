import type { HttpClient } from '@/infrastructure/http/http-client'
import { isRecord } from '@/infrastructure/http/response'
import { mapOperationFailure } from '@/infrastructure/http/map-operation-failure'
import type { HealthRepository } from '../../domain/repositories/health.repository'

/** Memvalidasi respons health backend dan memetakannya ke status domain. */
export function createHealthRepository(http: HttpClient): HealthRepository {
  return {
    async getHealth(signal) {
      try {
        const payload = await http.request('/health', { signal })
        if (!isRecord(payload) || (payload.status !== 'ok' && payload.status !== 'error') ||
          !isRecord(payload.checks) || !isRecord(payload.checks.database) ||
          (payload.checks.database.status !== 'ok' && payload.checks.database.status !== 'error')) throw new Error('invalidResponse')
        return { ok: true, data: { api: payload.status, database: payload.checks.database.status } }
      } catch (error) { return { ok: false, failure: mapOperationFailure(error) } }
    },
  }
}
