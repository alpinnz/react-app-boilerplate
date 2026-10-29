import type { RouteObject } from 'react-router-dom'
import type { GetHealth } from '../domain/usecases/get-health.usecase'
import { HealthPage } from '../presentation/pages/HealthPage'

/** URL paths owned by the health module. */
export const healthRoutePaths = {
  status: '/status',
}

/**
 * Creates the health route using an operation supplied by the app.
 *
 * @param getHealth - Health request operation.
 * @returns React Router route objects for service status.
 */
export function createHealthRoutes(getHealth: GetHealth): RouteObject[] {
  return [{ path: healthRoutePaths.status, element: <HealthPage getHealth={getHealth} /> }]
}
