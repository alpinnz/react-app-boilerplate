/**
 * Public API for user listing, details, and role assignment.
 *
 * @packageDocumentation
 */

import { createUsersDependencies } from './di/users.dependencies'

export { UserListPage } from './presentation/pages/user-list/UserListPage'
export { UserDetailPage } from './presentation/pages/user-detail/UserDetailPage'
export type { User } from './domain/entities/user'
export { userPermissionLevels } from './domain/values/user-permission-levels'
export type { AssignableRole, ListAssignableRoles } from './presentation/pages/user-detail/assignable-role'
export { createUsersDependencies }
/** User operations created by {@link createUsersDependencies}. */
export type UsersDependencies = ReturnType<typeof createUsersDependencies>
export { createUsersRoutes, usersRoutePaths } from './router/users.routes'
