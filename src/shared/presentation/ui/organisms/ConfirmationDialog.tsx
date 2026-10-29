import { Button } from '../atoms/Button'
import { Modal } from './Modal'

type ConfirmationDialogProps = {
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  isConfirming?: boolean
  onConfirm: () => void
  onDismiss: () => void
}

/** Dialog konfirmasi untuk tindakan yang mengubah atau mengakhiri state pengguna. */
export function ConfirmationDialog({ title, description, confirmLabel, cancelLabel, isConfirming = false, onConfirm, onDismiss }: ConfirmationDialogProps) {
  return <Modal titleId="confirmation-title" descriptionId="confirmation-description" onDismiss={onDismiss} canDismiss={!isConfirming}>
    <h2 id="confirmation-title" className="text-center text-xl font-semibold">{title}</h2>
    <p id="confirmation-description" className="mt-2 text-center text-sm leading-6 text-content-muted">{description}</p>
    <div className="mt-5 grid gap-2 sm:grid-cols-2">
      <Button type="button" variant="secondary" disabled={isConfirming} onClick={onDismiss}>{cancelLabel}</Button>
      <Button type="button" variant="danger" disabled={isConfirming} onClick={onConfirm}>{confirmLabel}</Button>
    </div>
  </Modal>
}
