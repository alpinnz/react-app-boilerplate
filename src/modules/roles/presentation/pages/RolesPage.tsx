import { useContext, useEffect, useState, type FormEvent } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems, MenuSeparator } from '@headlessui/react'
import { useLocalization } from '@valfuse-node/react'
import { useStore } from 'zustand'
import { Button } from '@/shared/presentation/ui/atoms/Button'
import { IconButton } from '@/shared/presentation/ui/atoms/IconButton'
import { InputNumber } from '@/shared/presentation/ui/atoms/InputNumber'
import { InputSearch } from '@/shared/presentation/ui/atoms/InputSearch'
import { InputText } from '@/shared/presentation/ui/atoms/InputText'
import { InlineFeedback } from '@/shared/presentation/ui/molecules/InlineFeedback'
import { GroupForm } from '@/shared/presentation/ui/molecules/GroupForm'
import { getFieldError } from '@/shared/presentation/validation/field-errors'
import { ConfirmationDialog } from '@/shared/presentation/ui/organisms/ConfirmationDialog'
import { DataTable, type DataTableColumn } from '@/shared/presentation/ui/organisms/DataTable'
import { Modal } from '@/shared/presentation/ui/organisms/Modal'
import { UnsavedChangesPrompt } from '@/shared/presentation/ui/organisms/UnsavedChangesPrompt'
import { useFailureToast, useToast } from '@/shared/presentation/ui/organisms/useToast'
import { PullToRefresh } from '@/shared/presentation/ui/organisms/PullToRefresh'
import { useLocalizedMessage } from '@/shared/presentation/localization/useLocalizedMessage'
import type { Role } from '../../domain/entities/role'
import type { RoleUseCases } from '../../domain/usecases/role.usecases'
import { RolesContext } from '../state/roles.context'
import { createRolesStore } from '../state/roles.store'

const systemRoleNames = new Set(['owner', 'admin', 'staff', 'user'])

type RoleActionMode = 'view' | 'edit' | 'delete'
type PendingRoleAction = { type: 'select'; id: string; mode: 'view' | 'edit' } | { type: 'deleteRole'; id: string } | { type: 'closeRole' } | { type: 'closeCreate' }

function canManageRole(role: Role, actorLevel: number) {
  return !systemRoleNames.has(role.name) && role.level < actorLevel
}

function RolesView({ actorLevel }: { actorLevel: number }) {
  const { translate, format } = useLocalization()
  const localizeMessage = useLocalizedMessage()
  const { showToast } = useToast()
  const showFailureToast = useFailureToast()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [pendingRoleAction, setPendingRoleAction] = useState<PendingRoleAction | null>(null)
  const [selectedRoleMode, setSelectedRoleMode] = useState<RoleActionMode>('view')
  const [roleSearch, setRoleSearch] = useState('')
  const contextStore = useContext(RolesContext)
  if (!contextStore) throw new Error('RolesProvider belum dipasang.')
  const store = contextStore
  const state = useStore(store, (current) => current)
  const busy = state.actionStatus.type === 'loading'
  const hasUnsavedRoleEdit = !!state.selected && (state.editName !== state.selected.name || state.editLevel !== String(state.selected.level))
  const hasUnsavedCreate = !!(state.createName || state.createLevel)
  const hasUnsavedChanges = hasUnsavedCreate || hasUnsavedRoleEdit
  const actionFailure = state.actionStatus.type === 'failure' ? state.actionStatus : undefined
  const roleFailure = actionFailure && actionFailure.fieldErrors ? actionFailure : undefined
  const canManageSelected = !!state.selected && canManageRole(state.selected, actorLevel)
  const rolesAreLoading = state.roles.status.type === 'initial' || state.roles.status.type === 'loading'
  const rolesAreRefreshing = state.roles.status.type === 'refreshing'
  const searchPattern = roleSearch.trim().toLocaleLowerCase()
  const visibleRoles = (state.roles.data ?? []).filter((role) => {
    if (!searchPattern) return true
    const type = translate(systemRoleNames.has(role.name) ? 'roles.builtIn' : 'roles.custom')
    return `${role.name} ${role.level} ${type}`.toLocaleLowerCase().includes(searchPattern)
  })

  async function refreshRoles() {
    await store.getState().load()
    const status = store.getState().roles.status
    if (status.type === 'failure') showFailureToast(status.failure.message)
  }

  async function loadRole(id: string, mode: RoleActionMode = 'view') {
    await store.getState().select(id)
    const status = store.getState().actionStatus
    if (status.type === 'failure') showFailureToast(status.message)
    else if (store.getState().selected?.id === id) {
      setSelectedRoleMode(mode)
      if (mode === 'delete') store.getState().askDelete()
    }
  }

  function selectRole(id: string, mode: 'view' | 'edit' = 'view') {
    if (hasUnsavedRoleEdit) {
      setPendingRoleAction({ type: 'select', id, mode })
      return
    }
    void loadRole(id, mode)
  }

  function requestDeleteRole(id: string) {
    if (hasUnsavedRoleEdit) {
      setPendingRoleAction({ type: 'deleteRole', id })
      return
    }
    void loadRole(id, 'delete')
  }

  function closeSelectedRole() {
    store.getState().closeDetail()
    setSelectedRoleMode('view')
  }

  function requestCloseRole() {
    if (hasUnsavedRoleEdit) setPendingRoleAction({ type: 'closeRole' })
    else closeSelectedRole()
  }

  function requestCloseCreate() {
    if (hasUnsavedCreate) setPendingRoleAction({ type: 'closeCreate' })
    else setIsCreateOpen(false)
  }

  function discardPendingRoleAction() {
    const action = pendingRoleAction
    setPendingRoleAction(null)
    if (action?.type === 'select') void loadRole(action.id, action.mode)
    if (action?.type === 'deleteRole') void loadRole(action.id, 'delete')
    if (action?.type === 'closeRole') closeSelectedRole()
    if (action?.type === 'closeCreate') {
      store.getState().setCreateName('')
      store.getState().setCreateLevel('')
      setIsCreateOpen(false)
    }
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = store.getState().createName
    await store.getState().create()
    const status = store.getState().actionStatus
    if (status.type === 'success') {
      showToast({ tone: 'success', title: translate('roles.roleCreatedToastTitle'), description: format('roles.roleCreatedToastDescription', { name }) })
      setIsCreateOpen(false)
    } else if (status.type === 'failure') {
      showFailureToast(status.message)
    }
  }

  async function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = store.getState().editName
    await store.getState().update()
    const status = store.getState().actionStatus
    if (status.type === 'success') {
      showToast({ tone: 'success', title: translate('roles.roleUpdatedToastTitle'), description: format('roles.roleUpdatedToastDescription', { name }) })
      closeSelectedRole()
    } else if (status.type === 'failure') {
      showFailureToast(status.message)
    }
  }

  async function removeSelectedRole() {
    const name = store.getState().selected?.name ?? ''
    await store.getState().remove()
    const status = store.getState().actionStatus
    if (status.type === 'success') {
      showToast({ tone: 'success', title: translate('roles.roleDeletedToastTitle'), description: format('roles.roleDeletedToastDescription', { name }) })
      setSelectedRoleMode('view')
    } else if (status.type === 'failure') {
      showFailureToast(status.message)
    }
  }

  function cancelDelete() {
    store.getState().cancelDelete()
    closeSelectedRole()
  }

  function renderRoleActions(role: Role) {
    const canManage = canManageRole(role, actorLevel)
    const disabled = busy || rolesAreLoading || rolesAreRefreshing

    return (
      <Menu as="div" className="relative flex justify-end">
        <MenuButton
          as={IconButton}
          type="button"
          aria-label={format('roles.roleActions', { name: role.name })}
          disabled={disabled}
          variant="neutral-bordered"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-5"><circle cx="4" cy="10" r="1.5" /><circle cx="10" cy="10" r="1.5" /><circle cx="16" cy="10" r="1.5" /></svg>
        </MenuButton>
        <MenuItems
          anchor="bottom end"
          modal={false}
          transition
          className="z-50 mt-1 w-48 origin-top-right rounded-surface border border-line bg-surface p-1.5 shadow-popover outline-none transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0 motion-reduce:transition-none"
        >
          <MenuItem
            as={Button}
            type="button"
            variant="neutral"
            className="!min-h-10 !w-full !justify-start !gap-2.5 !px-3 !py-2 !text-left !text-app-body-regular-medium !text-content data-focus:!bg-canvas"
            onClick={() => selectRole(role.id, 'view')}
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-4 text-content-muted"><path d="M2 10s2.8-5 8-5 8 5 8 5-2.8 5-8 5-8-5-8-5Z" /><circle cx="10" cy="10" r="2" /></svg>
            {translate('common.detail')}
          </MenuItem>
          {canManage && <>
            <MenuItem
              as={Button}
              type="button"
              variant="neutral"
              className="!min-h-10 !w-full !justify-start !gap-2.5 !px-3 !py-2 !text-left !text-app-body-regular-medium !text-content data-focus:!bg-canvas"
              onClick={() => selectRole(role.id, 'edit')}
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-content-muted"><path d="m12.8 3.2 4 4M3 17l3.8-.8L16.5 6.5a1.4 1.4 0 0 0-2-2L4.8 14.2 3 17Z" /></svg>
              {translate('common.edit')}
            </MenuItem>
            <MenuSeparator className="my-1 border-t border-line" />
            <MenuItem
              as={Button}
              type="button"
              variant="quiet"
              className="!min-h-10 !w-full !justify-start !gap-2.5 !px-3 !py-2 !text-left !text-app-body-regular-medium data-focus:!bg-danger-soft"
              onClick={() => requestDeleteRole(role.id)}
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M3.5 5.5h13M8 5.5V3.8h4v1.7m-6.5 0 .8 11h7.4l.8-11M8 8.5v5m4-5v5" /></svg>
              {translate('roles.deleteRole')}
            </MenuItem>
          </>}
        </MenuItems>
      </Menu>
    )
  }

  const columns: DataTableColumn<Role>[] = [
    {
      id: 'name',
      label: translate('common.name'),
      pin: 'start',
      sortValue: (role) => role.name,
      className: 'min-w-44',
      render: (role) => <strong className="text-app-body-regular-semi-bold text-content">{role.name}</strong>,
    },
    {
      id: 'level',
      label: translate('common.level'),
      sortValue: (role) => role.level,
      className: 'min-w-24',
      render: (role) => <span className="inline-flex rounded-full bg-action-soft px-2 py-1 text-app-label-semi-bold text-action">{role.level}</span>,
    },
    {
      id: 'type',
      label: translate('roles.roleType'),
      className: 'min-w-28',
      render: (role) => <span className="text-content-muted">{systemRoleNames.has(role.name) ? translate('roles.builtIn') : translate('roles.custom')}</span>,
    },
    {
      id: 'actions',
      label: translate('common.actions'),
      pin: 'end',
      className: 'w-16 text-right',
      render: renderRoleActions,
    },
  ]

  return (
    <div className="min-w-0 space-y-section">
      <UnsavedChangesPrompt when={hasUnsavedChanges} />
      <PullToRefresh
        onRefresh={refreshRoles}
        isRefreshing={rolesAreRefreshing}
        disabled={busy || rolesAreLoading}
        pullLabel={translate('common.pullToRefresh')}
        releaseLabel={translate('common.releaseToRefresh')}
        refreshingLabel={translate('common.refreshing')}
      >
        <p className="max-w-3xl text-app-body-regular-regular text-content-muted">{translate('roles.rolesDescription')}</p>
        <div className="mt-section flex flex-col gap-form md:flex-row md:items-end md:justify-between">
          <div className="w-full max-w-lg">
            <GroupForm controlId="role-search" labelText={translate('roles.searchRoles')}>
              <InputSearch value={roleSearch} onChange={(event) => setRoleSearch(event.target.value)} placeholder={translate('roles.searchPlaceholder')} />
            </GroupForm>
          </div>
          <Button type="button" className="w-full md:w-auto" disabled={busy || actorLevel <= 1} onClick={() => setIsCreateOpen(true)}>
            {translate('roles.createRole')}
          </Button>
        </div>
        {state.roles.status.type === 'failure' && <div className="mt-form"><InlineFeedback tone="error">{localizeMessage(state.roles.status.failure.message)}</InlineFeedback></div>}
        {(state.roles.data !== null || rolesAreLoading) && <div className="mt-section">
          <DataTable
            label={translate('roles.roles')}
            columns={columns}
            rows={visibleRoles}
            rowKey={(role) => role.id}
            emptyTitle={translate(searchPattern ? 'roles.noRoleMatches' : 'roles.noRoles')}
            isLoading={state.roles.data === null && rolesAreLoading}
            isRefreshing={rolesAreRefreshing}
            renderMobileRow={(role) => <article className="flex min-h-[72px] items-center justify-between gap-3 px-4 py-form">
              <div className="min-w-0"><p className="truncate text-app-body-regular-semi-bold text-content">{role.name}</p><p className="mt-1 text-app-caption-regular text-content-muted">{translate('common.level')} {role.level} · {systemRoleNames.has(role.name) ? translate('roles.builtIn') : translate('roles.custom')}</p></div>
              <div className="shrink-0">{renderRoleActions(role)}</div>
            </article>}
          />
        </div>}
      </PullToRefresh>

      {isCreateOpen && <Modal title={translate('roles.createRole')} description={format('roles.createRoleDescription', { level: actorLevel })} onDismiss={requestCloseCreate} canDismiss={!busy} mobilePresentation="sheet" footer={<>
        <Button type="button" variant="secondary" disabled={busy} onClick={requestCloseCreate}>{translate('common.cancel')}</Button>
        <Button type="submit" form="role-create-form" disabled={busy} loading={busy} loadingLabel={translate('common.saving')}>{translate('roles.createRole')}</Button>
      </>}>
        <form id="role-create-form" className="grid gap-form" onSubmit={(event) => void create(event)}>
          <GroupForm controlId="role-create-name" labelText={translate('roles.roleName')} errorText={localizeMessage(getFieldError(roleFailure?.fieldErrors, 'name') ?? '') || undefined}>
            <InputText name="name" autoFocus required maxLength={50} pattern="[a-z](?:[a-z0-9_]|-)*" value={state.createName} onChange={(event) => state.setCreateName(event.target.value)} />
          </GroupForm>
          <GroupForm controlId="role-create-level" labelText={translate('common.level')} errorText={localizeMessage(getFieldError(roleFailure?.fieldErrors, 'level') ?? '') || undefined}>
            <InputNumber name="level" required min={1} max={actorLevel - 1} value={state.createLevel} onChange={(event) => state.setCreateLevel(event.target.value)} />
          </GroupForm>
          {actionFailure && !actionFailure.fieldErrors && <InlineFeedback tone="error">{localizeMessage(actionFailure.message)}</InlineFeedback>}
        </form>
      </Modal>}

      {state.selected && selectedRoleMode !== 'delete' && <Modal
        title={format(selectedRoleMode === 'edit' ? 'roles.editRole' : 'roles.roleDetail', { name: state.selected.name })}
        description={selectedRoleMode === 'edit'
          ? format('roles.editRoleDescription', { level: actorLevel })
          : translate('roles.roleDetailDescription')}
        onDismiss={requestCloseRole}
        canDismiss={!busy}
        mobilePresentation="sheet"
        footer={selectedRoleMode === 'edit' && canManageSelected ? <>
          <Button type="button" variant="secondary" disabled={busy} onClick={requestCloseRole}>{translate('common.cancel')}</Button>
          <Button type="submit" form="role-edit-form" disabled={busy} loading={busy} loadingLabel={translate('common.saving')}>{translate('common.save')}</Button>
        </> : <Button type="button" variant="secondary" disabled={busy} onClick={requestCloseRole}>{translate('common.close')}</Button>}
      >
        {selectedRoleMode === 'edit' && canManageSelected ? <form id="role-edit-form" className="grid gap-form" onSubmit={(event) => void update(event)}>
          <GroupForm controlId="role-edit-name" labelText={translate('roles.roleName')} errorText={localizeMessage(getFieldError(roleFailure?.fieldErrors, 'name') ?? '') || undefined}>
            <InputText name="name" autoFocus required maxLength={50} pattern="[a-z](?:[a-z0-9_]|-)*" value={state.editName} onChange={(event) => state.setEditName(event.target.value)} />
          </GroupForm>
          <GroupForm controlId="role-edit-level" labelText={translate('common.level')} errorText={localizeMessage(getFieldError(roleFailure?.fieldErrors, 'level') ?? '') || undefined}>
            <InputNumber name="level" required min={1} max={actorLevel - 1} value={state.editLevel} onChange={(event) => state.setEditLevel(event.target.value)} />
          </GroupForm>
          {actionFailure && !actionFailure.fieldErrors && <InlineFeedback tone="error">{localizeMessage(actionFailure.message)}</InlineFeedback>}
        </form> : <div className="grid gap-form">
          <dl className="grid grid-cols-1 gap-form rounded-control border border-line bg-surface p-form md:grid-cols-2">
            <div>
              <dt className="text-app-label-medium text-content-muted">{translate('roles.roleName')}</dt>
              <dd className="mt-1 text-app-body-regular-semi-bold text-content">{state.selected.name}</dd>
            </div>
            <div>
              <dt className="text-app-label-medium text-content-muted">{translate('common.level')}</dt>
              <dd className="mt-1 text-app-body-regular-semi-bold text-content">{state.selected.level}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-app-label-medium text-content-muted">{translate('roles.roleType')}</dt>
              <dd className="mt-1 text-app-body-regular-medium text-content">{systemRoleNames.has(state.selected.name) ? translate('roles.builtIn') : translate('roles.custom')}</dd>
            </div>
          </dl>
          {!canManageSelected && <InlineFeedback tone="info">{translate('roles.roleProtected')}</InlineFeedback>}
        </div>}
      </Modal>}

      {state.confirmDelete && state.selected && <Modal
        role="alertdialog"
        title={format('roles.deleteRoleTitle', { name: state.selected.name })}
        description={translate('roles.deleteRoleDescription')}
        onDismiss={cancelDelete}
        canDismiss={!busy}
        footer={<>
          <Button type="button" variant="secondary" disabled={busy} onClick={cancelDelete}>{translate('common.cancel')}</Button>
          <Button type="button" variant="danger" disabled={busy} loading={busy} loadingLabel={translate('common.loading')} onClick={() => void removeSelectedRole()}>{translate('common.delete')}</Button>
        </>}
      >
        {actionFailure && <div className="mb-3"><InlineFeedback tone="error">{localizeMessage(actionFailure.message)}</InlineFeedback></div>}
      </Modal>}

      {pendingRoleAction && <ConfirmationDialog
        title={translate('roles.discardRoleTitle')}
        description={translate('roles.discardRoleDescription')}
        cancelLabel={translate('common.continueEditing')}
        confirmLabel={translate('common.discard')}
        onDismiss={() => setPendingRoleAction(null)}
        onConfirm={discardPendingRoleAction}
      />}
    </div>
  )
}

/** Renders the role catalog and role administration actions available to the actor. */
export function RolesPage({ operations, actorLevel }: { operations: RoleUseCases; actorLevel: number }) {
  const [store] = useState(() => createRolesStore(operations, actorLevel))
  useEffect(() => { void store.getState().load(); return () => store.getState().cancelPending() }, [store])
  return <RolesContext.Provider value={store}><RolesView actorLevel={actorLevel} /></RolesContext.Provider>
}
