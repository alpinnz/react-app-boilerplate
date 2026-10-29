/**
 * Public API for service health status.
 *
 * @packageDocumentation
 */

export { HealthPage } from './presentation/pages/HealthPage'
export type { GetHealth } from './domain/usecases/get-health.usecase'
export { createHealthDependencies } from './di/health.dependencies'
export { createHealthRoutes, healthRoutePaths } from './router/health.routes'
