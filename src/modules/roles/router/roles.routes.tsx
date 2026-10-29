import type { RouteObject } from 'react-router-dom'
import type { RoleUseCases } from '../domain/usecases/role.usecases'
import { RolesPage } from '../presentation/pages/RolesPage'

/** URL paths owned by the roles module. */
export const rolesRoutePaths = {
  list: '/roles',
}

type RolesRouteDependencies = {
  operations: RoleUseCases
  actorLevel: number
  currentUserId: string
}

/**
 * Creates role routes with operations and actor scope supplied by the app.
 *
 * @param options - Role operations and current actor information.
 * @returns React Router route objects for role administration.
 */
export function createRolesRoutes(options: RolesRouteDependencies): RouteObject[] {
  const { operations, actorLevel, currentUserId } = options
  return [{
    path: rolesRoutePaths.list,
    element: <RolesPage key={currentUserId} operations={operations} actorLevel={actorLevel} />,
  }]
}
