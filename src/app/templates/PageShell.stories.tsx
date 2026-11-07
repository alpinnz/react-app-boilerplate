import type { Meta, StoryObj } from '@storybook/react'
import { PageShell } from './PageShell'

const meta = {
  title: 'App/Templates/PageShell',
  component: PageShell,
  args: {
    titleSection: <div>
      <h1 className="text-app-title-semi-bold text-content">User management</h1>
      <p className="mt-form text-app-body-regular-regular text-content-muted">Manage people and access in this workspace.</p>
    </div>,
    children: <div className="rounded-control bg-canvas p-section text-app-body-regular-regular text-content">Flexible page content slot</div>,
  },
} satisfies Meta<typeof PageShell>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const FullWidth: Story = {
  args: { className: 'min-h-96 w-full' },
}
