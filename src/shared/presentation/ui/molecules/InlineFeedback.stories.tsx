import type { Meta, StoryObj } from '@storybook/react-vite'
import { InlineFeedback } from './InlineFeedback'

const meta = {
  title: 'Shared UI/Molecules/InlineFeedback',
  component: InlineFeedback,
  args: { tone: 'info', children: 'Your profile is ready to review.' },
  parameters: { docs: { description: { component: 'Inline status feedback with semantic tone, icon, and announcement role.' } } },
} satisfies Meta<typeof InlineFeedback>

export default meta
type Story = StoryObj<typeof meta>

export const Information: Story = {}
export const Default: Story = { args: { tone: 'default', children: 'Additional context is available.' } }
export const Success: Story = { args: { tone: 'success', children: 'Changes saved successfully.' } }
export const Warning: Story = { args: { tone: 'warning', children: 'Review this setting before continuing.' } }
export const Error: Story = { args: { tone: 'error', children: 'We could not save your changes. Review the fields and try again.' } }
