import type { User } from '../../domain/entities/user'
import { useLocalization } from '@valfuse-node/react'
import type { ReactNode } from 'react'
import { Button } from '@/shared/presentation/ui/atoms/Button'
import { Hyperlink } from '@/shared/presentation/ui/atoms/Hyperlink'
import { DataTable, type DataTableColumn } from '@/shared/presentation/ui/organisms/DataTable'

/** Renders loaded users as a compact, sortable table with row-scoped actions. */
export function UserList({ users, currentUserId, canEdit, onEdit, onDelete, emptyTitle, emptyDescription, footer, isLoading, isRefreshing }: {
  users: User[]
  currentUserId: string
  canEdit: boolean
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  emptyTitle: string
  emptyDescription?: string
  footer: ReactNode
  isLoading: boolean
  isRefreshing: boolean
}) {
  const { translate, format } = useLocalization()
  const columns: DataTableColumn<User>[] = [
    {
      id: 'name',
      label: translate('common.name'),
      pin: 'start',
      sortValue: (user) => user.name,
      className: 'min-w-52',
      render: (user) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-app-label-bold text-accent-strong ring-1 ring-line">
            {user.name.trim().charAt(0).toLocaleUpperCase() || '?'}
          </span>
          <div className="min-w-0">
            <Hyperlink to={`/users/${encodeURIComponent(user.id)}`} treatment="neutral" className="block max-w-52 truncate !text-app-hyperlink-regular-semi-bold">{user.name}</Hyperlink>
            {user.id === currentUserId && <span className="mt-0.5 inline-flex rounded-full bg-action-soft px-1.5 py-0.5 text-app-label-semi-bold text-action">{translate('users.currentUser')}</span>}
          </div>
        </div>
      ),
    },
    {
      id: 'email',
      label: translate('common.email'),
      sortValue: (user) => user.email,
      className: 'min-w-56',
      render: (user) => <span className="block max-w-64 truncate text-content-muted">{user.email}</span>,
    },
    {
      id: 'phone',
      label: translate('users.phoneColumn'),
      sortValue: (user) => user.phoneNumber ?? '',
      className: 'min-w-36',
      render: (user) => <span className="whitespace-nowrap text-content-muted">{[user.countryCode, user.phoneNumber].filter(Boolean).join(' ') || '—'}</span>,
    },
    ...(canEdit ? [{
      id: 'actions',
      label: translate('common.actions'),
      pin: 'end' as const,
      className: 'w-40 text-right',
      render: (user: User) => user.id === currentUserId ? (
        <span className="text-app-caption-regular text-content-muted">{translate('users.currentUser')}</span>
      ) : (
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" className="!min-h-9 !px-2.5 !py-1" aria-label={format('users.editUserAction', { name: user.name })} onClick={() => onEdit(user)}>{translate('common.edit')}</Button>
          <Button type="button" variant="quiet" className="!min-h-9 !px-2.5 !py-1" aria-label={format('users.deleteUserAction', { name: user.name })} onClick={() => onDelete(user)}>{translate('common.delete')}</Button>
        </div>
      ),
    }] : []),
  ]

  return <DataTable
    label={translate('users.userList')}
    columns={columns}
    rows={users}
    rowKey={(user) => user.id}
    emptyTitle={emptyTitle}
    emptyDescription={emptyDescription}
    isLoading={isLoading}
    isRefreshing={isRefreshing}
    renderMobileRow={(user) => <article className="px-surface py-form">
      <div className="flex items-start gap-2.5">
        <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft text-app-label-bold text-accent-strong ring-1 ring-line">
          {user.name.trim().charAt(0).toLocaleUpperCase() || '?'}
        </span>
        <div className="min-w-0 flex-1">
          <Hyperlink to={`/users/${encodeURIComponent(user.id)}`} treatment="neutral" className="block truncate !text-app-hyperlink-regular-semi-bold">{user.name}</Hyperlink>
          {user.id === currentUserId && <span className="mt-0.5 inline-flex rounded-full bg-action-soft px-1.5 py-0.5 text-app-label-semi-bold text-action">{translate('users.currentUser')}</span>}
          <p className="mt-1 break-all text-app-caption-regular text-content-muted">{user.email}</p>
          {user.phoneNumber && <p className="mt-1 text-app-caption-regular text-content-muted">{[user.countryCode, user.phoneNumber].filter(Boolean).join(' ')}</p>}
        </div>
      </div>
      {canEdit && user.id !== currentUserId && <div className="mt-3 flex justify-end gap-2 border-t border-line pt-2">
        <Button type="button" variant="secondary" className="!min-h-10 !px-3 !py-1" aria-label={format('users.editUserAction', { name: user.name })} onClick={() => onEdit(user)}>{translate('common.edit')}</Button>
        <Button type="button" variant="quiet" className="!min-h-10 !px-3 !py-1" aria-label={format('users.deleteUserAction', { name: user.name })} onClick={() => onDelete(user)}>{translate('common.delete')}</Button>
      </div>}
    </article>}
    footer={footer}
  />
}
