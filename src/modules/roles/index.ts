/**
 * Public API for role catalog and role administration.
 *
 * @packageDocumentation
 */

export { RolesPage } from './presentation/pages/RolesPage'
export type { Role } from './domain/entities/role'
export type { RoleUseCases } from './domain/usecases/role.usecases'
export { createRoleDependencies } from './di/roles.dependencies'
export { createRolesRoutes, rolesRoutePaths } from './router/roles.routes'
