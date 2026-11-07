import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../atoms/Button'
import { useToast } from './useToast'

function ToastExamples() {
  const { showToast } = useToast()
  return <div className="grid max-w-sm gap-3 p-6">
    <Button type="button" onClick={() => showToast({ tone: 'success', title: 'Changes saved', description: 'Your profile is up to date.' })}>Show success</Button>
    <Button type="button" variant="secondary" onClick={() => showToast({ tone: 'default', title: 'New notification', description: 'A new update is available.' })}>Show default</Button>
    <Button type="button" variant="secondary" onClick={() => showToast({ tone: 'info', title: 'Sync started', description: 'We will notify you when the sync finishes.' })}>Show information</Button>
    <Button type="button" variant="secondary" onClick={() => showToast({ tone: 'warning', title: 'Review required', description: 'Check this setting before continuing.' })}>Show warning</Button>
    <Button type="button" variant="danger" onClick={() => showToast({ tone: 'error', title: 'Request failed', description: 'Try again in a moment.' })}>Show error</Button>
  </div>
}

const meta = {
  title: 'Shared UI/Organisms/ToastProvider',
  component: ToastExamples,
  parameters: { docs: { description: { component: 'App-scoped toast queue. The provider is global in Storybook; use the buttons to preview each live region and dismiss behavior.' } } },
} satisfies Meta<typeof ToastExamples>

export default meta
type Story = StoryObj<typeof meta>

export const Tones: Story = {}
