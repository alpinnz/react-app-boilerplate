import { createHealthRepository } from '@/modules/health/data/repositories/health.repository.impl'
import { createGetHealth } from '@/modules/health/domain/usecases/get-health.usecase'
import type { HttpClient } from '@/infrastructure/http/http-client'

/**
 * Creates the health request operation from the shared HTTP client.
 *
 * @param http - HTTP client used to query service health.
 * @returns A health operation for app-level composition.
 */
export function createHealthDependencies(http: HttpClient) {
  return createGetHealth(createHealthRepository(http))
}
