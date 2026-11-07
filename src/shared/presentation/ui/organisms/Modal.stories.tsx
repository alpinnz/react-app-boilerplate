import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../atoms/Button'
import { InlineFeedback } from '../molecules/InlineFeedback'
import { Modal } from './Modal'

/** Demonstrates informational copy in the body and actions in the modal footer. */
function ModalExample() {
  const [isOpen, setIsOpen] = useState(true)
  return isOpen
    ? <Modal title="Edit user" description="Update account details and access." onDismiss={() => setIsOpen(false)} mobilePresentation="sheet" footer={<>
        <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
        <Button type="button" onClick={() => setIsOpen(false)}>Save changes</Button>
      </>}>
        <InlineFeedback tone="info">Changes are saved when you confirm.</InlineFeedback>
      </Modal>
    : <div className="grid min-h-dvh place-items-center"><Button type="button" onClick={() => setIsOpen(true)}>Open modal</Button></div>
}

const meta = {
  title: 'Shared UI/Organisms/Modal',
  component: ModalExample,
  parameters: { docs: { description: { component: 'Accessible modal with a title header, informational body, separated action footer, focus management, and optional mobile sheet presentation.' } } },
} satisfies Meta<typeof ModalExample>

export default meta
type Story = StoryObj<typeof meta>

export const MobileSheet: Story = { globals: { viewport: { value: 'mobile1', isRotated: false } } }
export const CenteredDialog: Story = { globals: { viewport: { value: 'desktop', isRotated: false } } }
