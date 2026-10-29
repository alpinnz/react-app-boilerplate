import type { User } from '../../domain/entities/user'
import { Button } from '@/shared/presentation/ui/atoms/Button'
import { Link } from 'react-router-dom'
import { useLocalization } from '@valfuse-node/react'

/**
 * Renders user rows and exposes edit/delete actions only when allowed.
 * The current user is excluded from destructive or self-edit actions.
 */
export function UserList({ users, currentUserId, canEdit, onEdit, onDelete }: {
  users: User[]
  currentUserId: string
  canEdit: boolean
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}) {
  const { translate } = useLocalization()
  return (
    <ul className="divide-y divide-line border-t border-line">
      {users.map((user) => (
        <li key={user.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <Link className="block truncate font-semibold text-action underline" to={`/users/${encodeURIComponent(user.id)}`}>{user.name}</Link>
            <span className="block truncate text-sm text-content-muted">{user.email}</span>
          </div>
          {canEdit && user.id !== currentUserId && (
            <div className="flex shrink-0 gap-2">
              <Button type="button" variant="secondary" onClick={() => onEdit(user)}>{translate('common.edit')}</Button>
              <Button type="button" variant="quiet" onClick={() => onDelete(user)}>{translate('common.delete')}</Button>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
