import { createElement } from 'react'
import type { RouteObject } from 'react-router-dom'
import type { ChangeUserRole } from '../domain/usecases/change-user-role.usecase'
import type { DeleteUser } from '../domain/usecases/delete-user.usecase'
import type { GetUser } from '../domain/usecases/get-user.usecase'
import type { GetUsers } from '../domain/usecases/get-users.usecase'
import type { UpdateUser } from '../domain/usecases/update-user.usecase'
import type { ListAssignableRoles } from '../presentation/pages/user-detail/assignable-role'
import { UserDetailRoute, UsersPageRoute } from './users-route-components'

/** URL paths owned by the users module. */
export const usersRoutePaths = {
  list: '/users',
  detail: '/users/:userId',
  detailPrefix: '/users/',
}

/** Operasi pengguna yang diperlukan oleh halaman daftar dan detail. */
export type UserRouteDependencies = {
  getUsers: GetUsers
  getUser: GetUser
  changeUserRole: ChangeUserRole
  updateUser: UpdateUser
  deleteUser: DeleteUser
}

/** Dependency route pengguna beserta role loader dan identitas aktor aktif. */
export type UsersRouteDependencies = {
  users: UserRouteDependencies
  listAssignableRoles: ListAssignableRoles
  currentUserId: string
  actorLevel: number
}

/**
 * Creates user routes with operations and actor scope supplied by the app.
 *
 * @param options - User operations, assignable roles, and current actor information.
 * @returns React Router route objects for user listing and details.
 */
export function createUsersRoutes(options: UsersRouteDependencies): RouteObject[] {
  const { users, listAssignableRoles, currentUserId, actorLevel } = options
  const dependencies = { users, listAssignableRoles, currentUserId, actorLevel }
  return [
    { path: usersRoutePaths.list, element: createElement(UsersPageRoute, { users, currentUserId, actorLevel }) },
    { path: usersRoutePaths.detail, element: createElement(UserDetailRoute, dependencies) },
  ]
}
