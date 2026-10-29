import { useBlocker } from 'react-router-dom'
import { useLocalization } from '@valfuse-node/react'
import { ConfirmationDialog } from './ConfirmationDialog'

/** Menahan perpindahan route saat form di halaman ini masih memiliki perubahan. */
export function UnsavedChangesPrompt({ when }: { when: boolean }) {
  const { translate } = useLocalization()
  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    when && (currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search),
  )

  if (blocker.state !== 'blocked') return null

  return <ConfirmationDialog
    title={translate('common.unsavedTitle')}
    description={translate('common.unsavedDescription')}
    cancelLabel={translate('common.stay')}
    confirmLabel={translate('common.leave')}
    onDismiss={() => blocker.reset()}
    onConfirm={() => blocker.proceed()}
  />
}
