import type { HealthRepository } from '../repositories/health.repository'

/** Membuat operasi pemeriksaan status layanan melalui repository domain. */
export function createGetHealth(repository: HealthRepository) {
  return (signal?: AbortSignal) => repository.getHealth(signal)
}

/** Health request operation consumed by the page and route factory. */
export type GetHealth = ReturnType<typeof createGetHealth>
