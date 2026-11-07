import { Dialog, DialogBackdrop, DialogDescription, DialogPanel, DialogTitle } from '@headlessui/react'
import type { ReactNode } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { IconButton } from '../atoms/IconButton'

type ModalProps = {
  /** Accessible dialog title displayed in the header. */
  title: ReactNode
  /** Informational message rendered at the start of the body, below the header divider. */
  description?: ReactNode
  /** Close request used by Escape, backdrop, and the header close control. */
  onDismiss: () => void
  /** Pinned action area below the body divider; form buttons can target a body form by ID. */
  footer: ReactNode
  /** Prevents dialog dismissal while an operation must finish. */
  canDismiss?: boolean
  /** Use alertdialog when the user must confirm a consequential action. */
  role?: 'dialog' | 'alertdialog'
  /** Chooses a centered desktop panel or a bottom sheet through tablet widths. */
  mobilePresentation?: 'center' | 'sheet'
  /** Scrollable form or interactive content rendered after the description. */
  children?: ReactNode
}

/** Shared dialog layout with an accessible header, scrollable body, and pinned footer. */
export function Modal({ title, description, onDismiss, footer, canDismiss = true, role = 'dialog', mobilePresentation = 'sheet', children }: ModalProps) {
  const { translate } = useLocalization()

  function requestClose() {
    if (canDismiss) onDismiss()
  }

  const isMobileSheet = mobilePresentation === 'sheet'
  const framePlacement = isMobileSheet ? 'items-end p-0 lg:place-items-center lg:p-4' : 'place-items-center p-4'
  const backdropInset = isMobileSheet ? 'inset-0 lg:inset-4' : 'inset-4'
  const panelShape = isMobileSheet
    ? 'max-h-[80dvh] rounded-t-sheet border-x border-t border-b-0 pb-[max(1rem,env(safe-area-inset-bottom))] lg:rounded-surface lg:border lg:pb-6'
    : 'max-h-[80dvh] rounded-surface border'
  const panelWidth = isMobileSheet ? 'max-w-none lg:max-w-[30rem]' : 'max-w-[30rem]'
  const panelShadow = isMobileSheet ? 'shadow-none lg:shadow-surface' : 'shadow-surface'
  const panelTransition = isMobileSheet ? 'data-closed:translate-y-6 lg:data-closed:translate-y-2' : 'data-closed:translate-y-2'

  return (
    <Dialog open transition role={role} onClose={requestClose} className="fixed inset-0 z-50">
      <DialogBackdrop transition className={`fixed ${backdropInset} bg-overlay duration-200 ease-out data-closed:opacity-0 motion-reduce:transition-none`} />
      <div className={`fixed inset-0 z-50 grid overflow-y-auto ${framePlacement}`}>
        <DialogPanel transition className={`flex w-full ${panelWidth} flex-col overflow-hidden border-line bg-surface px-surface pb-4 pt-3 text-content ${panelShadow} outline-none duration-200 ease-out ${panelShape} ${panelTransition} data-closed:opacity-0 motion-reduce:transition-none lg:p-6`}>
          {isMobileSheet && <div aria-hidden="true" className="mb-3 flex justify-center lg:hidden"><span className="h-1 w-9 rounded-full bg-line-strong" /></div>}
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-line pb-4">
            <div className="min-w-0">
              <DialogTitle className="text-app-title-semi-bold text-content">{title}</DialogTitle>
            </div>
            {canDismiss && <IconButton
              type="button"
              aria-label={translate('common.close')}
              variant="neutral"
              className="-mr-1 -mt-1 !shrink-0 hover:!bg-canvas focus-visible:!outline-offset-1"
              onClick={onDismiss}
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="size-4"><path d="m5 5 10 10M15 5 5 15" /></svg>
            </IconButton>}
          </div>
          <div className={`min-h-0 flex-1 overflow-y-auto ${isMobileSheet ? 'py-6 lg:py-4' : 'py-4'}`}>
            {description && <DialogDescription className="mb-form text-app-body-regular-regular text-content-muted">{description}</DialogDescription>}
            {children}
          </div>
          <div className="shrink-0 border-t border-line pt-4">
            <div className="grid grid-flow-col auto-cols-fr gap-2 lg:flex lg:justify-end [&>button]:w-full lg:[&>button]:w-auto">{footer}</div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
