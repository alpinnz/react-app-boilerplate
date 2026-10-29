import type { Result } from '@/shared/domain/result'
import type { OperationFailure } from '@/shared/domain/operation-failure'
import type { HealthStatus } from '../entities/health-status'

/** Kontrak domain untuk memeriksa dependensi layanan. */
export interface HealthRepository {
  getHealth(signal?: AbortSignal): Promise<Result<HealthStatus, OperationFailure>>
}
