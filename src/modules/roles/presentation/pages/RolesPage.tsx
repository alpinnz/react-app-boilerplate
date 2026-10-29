import { useContext, useEffect, useState, type FormEvent } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { useStore } from 'zustand'
import { Button } from '@/shared/presentation/ui/atoms/Button'
import { Surface } from '@/shared/presentation/ui/atoms/Surface'
import { InlineFeedback } from '@/shared/presentation/ui/molecules/InlineFeedback'
import { TextField } from '@/shared/presentation/ui/molecules/TextField'
import { ConfirmationDialog } from '@/shared/presentation/ui/organisms/ConfirmationDialog'
import { Modal } from '@/shared/presentation/ui/organisms/Modal'
import { UnsavedChangesPrompt } from '@/shared/presentation/ui/organisms/UnsavedChangesPrompt'
import { useLocalizedMessage } from '@/shared/presentation/localization/useLocalizedMessage'
import type { RoleUseCases } from '../../domain/usecases/role.usecases'
import { RolesContext } from '../state/roles.context'
import { createRolesStore } from '../state/roles.store'

const systemRoleNames = new Set(['owner', 'admin', 'staff', 'user'])

function RolesView({ actorLevel }: { actorLevel: number }) {
  const { translate, format } = useLocalization()
  const localizeMessage = useLocalizedMessage()
  const [pendingRoleAction, setPendingRoleAction] = useState<{ type: 'select'; id: string } | { type: 'close' } | null>(null)
  const store = useContext(RolesContext)
  if (!store) throw new Error('RolesProvider belum dipasang.')
  const state = useStore(store, (current) => current)
  const busy = state.actionStatus.type === 'loading'
  const canManageSelected = !!state.selected && !systemRoleNames.has(state.selected.name) && state.selected.level < actorLevel
  const hasUnsavedRoleEdit = !!state.selected && (state.editName !== state.selected.name || state.editLevel !== String(state.selected.level))
  const hasUnsavedChanges = !!(state.createName || state.createLevel || hasUnsavedRoleEdit)

  function create(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void state.create() }
  function update(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void state.update() }
  function selectRole(id: string) {
    if (hasUnsavedRoleEdit) { setPendingRoleAction({ type: 'select', id }); return }
    void state.select(id)
  }
  function closeDetail() {
    if (hasUnsavedRoleEdit) { setPendingRoleAction({ type: 'close' }); return }
    state.closeDetail()
  }
  function discardRoleEdit() {
    const action = pendingRoleAction
    setPendingRoleAction(null)
    if (action?.type === 'select') void state.select(action.id)
    if (action?.type === 'close') state.closeDetail()
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,1fr)] lg:items-start">
      <UnsavedChangesPrompt when={hasUnsavedChanges} />
      <Surface>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><h1 className="text-page-title font-semibold tracking-tight">{translate('roles.roles')}</h1><p className="mt-2 text-sm text-content-muted">{translate('roles.rolesDescription')}</p></div>
          <Button type="button" variant="secondary" disabled={busy} onClick={() => void state.load()}>{translate('common.refresh')}</Button>
        </div>
        <div className="mt-5 grid gap-3">
          {(state.roles.status.type === 'initial' || state.roles.status.type === 'loading') && <InlineFeedback tone="info">{translate('roles.loadingRoles')}</InlineFeedback>}
          {state.roles.status.type === 'failure' && <InlineFeedback tone="error">{localizeMessage(state.roles.status.failure.message)}</InlineFeedback>}
          {state.roles.status.type === 'noData' && <InlineFeedback tone="info">{translate('roles.noRoles')}</InlineFeedback>}
          {state.roles.data && state.roles.data.length > 0 && (
            <ul className="divide-y divide-line border-t border-line">
              {state.roles.data.map((role) => <li key={role.id} className="flex items-center justify-between gap-3 py-3">
                <div><strong className="font-semibold">{role.name}</strong><p className="text-sm text-content-muted">{translate('common.level')} {role.level}{systemRoleNames.has(role.name) ? ` · ${translate('roles.builtIn')}` : ''}</p></div>
                <Button type="button" variant="secondary" disabled={busy} onClick={() => selectRole(role.id)}>{translate('common.detail')}</Button>
              </li>)}
            </ul>
          )}
        </div>
      </Surface>
      <div className="grid gap-4">
        <Surface>
          <h2 className="text-xl font-semibold">{translate('roles.createRole')}</h2>
          <p className="mt-2 text-sm text-content-muted">{format('roles.createRoleDescription', { level: actorLevel })}</p>
          <form className="mt-4 grid gap-3" onSubmit={create}>
            <TextField id="role-create-name" label={translate('roles.roleName')} required maxLength={50} pattern="[a-z](?:[a-z0-9_]|-)*" value={state.createName} onChange={(event) => state.setCreateName(event.target.value)} />
            <TextField id="role-create-level" label={translate('common.level')} type="number" required min={1} max={actorLevel - 1} value={state.createLevel} onChange={(event) => state.setCreateLevel(event.target.value)} />
            {!state.selected && state.actionStatus.type === 'failure' && <InlineFeedback tone="error">{localizeMessage(state.actionStatus.message)}</InlineFeedback>}
            {!state.selected && state.actionStatus.type === 'success' && <InlineFeedback tone="success">{translate('roles.roleSaved')}</InlineFeedback>}
            <Button type="submit" disabled={busy || actorLevel <= 1}>{translate('roles.createRole')}</Button>
          </form>
        </Surface>
        {state.selected && <Surface>
          <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">{translate('roles.roleDetail')}</h2><Button type="button" variant="secondary" onClick={closeDetail}>{translate('common.close')}</Button></div>
          <p className="mt-2 break-all text-xs text-content-muted">ID: {state.selected.id}</p>
          {canManageSelected ? <form className="mt-4 grid gap-3" onSubmit={update}>
            <TextField id="role-edit-name" label={translate('roles.roleName')} required maxLength={50} pattern="[a-z](?:[a-z0-9_]|-)*" value={state.editName} onChange={(event) => state.setEditName(event.target.value)} />
            <TextField id="role-edit-level" label={translate('common.level')} type="number" required min={1} max={actorLevel - 1} value={state.editLevel} onChange={(event) => state.setEditLevel(event.target.value)} />
            {state.actionStatus.type === 'failure' && <InlineFeedback tone="error">{localizeMessage(state.actionStatus.message)}</InlineFeedback>}
            {state.actionStatus.type === 'success' && <InlineFeedback tone="success">{translate('roles.roleUpdated')}</InlineFeedback>}
            <div className="flex flex-wrap gap-2"><Button type="submit" disabled={busy}>{translate('common.save')}</Button><Button type="button" variant="danger" disabled={busy} onClick={state.askDelete}>{translate('roles.deleteRole')}</Button></div>
          </form> : <InlineFeedback tone="info">{translate('roles.roleProtected')}</InlineFeedback>}
        </Surface>}
      </div>
      {state.confirmDelete && state.selected && <Modal titleId="role-delete-title" onDismiss={state.cancelDelete} canDismiss={!busy}>
        <h2 id="role-delete-title" className="text-xl font-semibold">{format('roles.deleteRoleTitle', { name: state.selected.name })}</h2>
        <p className="mt-3 text-sm text-content-muted">{translate('roles.deleteRoleDescription')}</p>
        {state.actionStatus.type === 'failure' && <div className="mt-4"><InlineFeedback tone="error">{localizeMessage(state.actionStatus.message)}</InlineFeedback></div>}
        <div className="mt-6 flex justify-end gap-2"><Button type="button" variant="secondary" disabled={busy} onClick={state.cancelDelete}>{translate('common.cancel')}</Button><Button type="button" variant="danger" disabled={busy} onClick={() => void state.remove()}>{translate('common.delete')}</Button></div>
      </Modal>}
      {pendingRoleAction && <ConfirmationDialog
        title={translate('roles.discardRoleTitle')}
        description={translate('roles.discardRoleDescription')}
        cancelLabel={translate('common.continueEditing')}
        confirmLabel={translate('common.discard')}
        onDismiss={() => setPendingRoleAction(null)}
        onConfirm={discardRoleEdit}
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
