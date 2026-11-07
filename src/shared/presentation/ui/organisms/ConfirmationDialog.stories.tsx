import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../atoms/Button'
import { ConfirmationDialog } from './ConfirmationDialog'

function ConfirmationExample() {
  const [isOpen, setIsOpen] = useState(true)
  return isOpen
    ? <ConfirmationDialog title="Delete this role?" description="The role cannot be deleted while active users are assigned to it. Once deleted, it will no longer be available for assignment." confirmLabel="Delete role" cancelLabel="Keep role" onConfirm={() => setIsOpen(false)} onDismiss={() => setIsOpen(false)} />
    : <div className="grid min-h-dvh place-items-center"><Button type="button" variant="danger" onClick={() => setIsOpen(true)}>Open confirmation</Button></div>
}

const meta = {
  title: 'Shared UI/Organisms/ConfirmationDialog',
  component: ConfirmationExample,
  parameters: { docs: { description: { component: 'Destructive or consequential confirmation built from the shared accessible Modal.' } } },
} satisfies Meta<typeof ConfirmationExample>

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {}
