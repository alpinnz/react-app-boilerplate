import type { Meta, StoryObj } from '@storybook/react-vite'
import { TextField } from './TextField'

const meta = {
  title: 'Shared UI/Molecules/Compatibility/TextField',
  component: TextField,
  args: { id: 'legacy-password', label: 'Password', type: 'password', autoComplete: 'current-password', hint: 'Use your current password.' },
  parameters: { docs: { description: { component: 'Compatibility composition for existing consumers. New forms should use GroupForm with a named Input* component.' } } },
} satisfies Meta<typeof TextField>

export default meta
type Story = StoryObj<typeof meta>

export const Password: Story = {}
export const Email: Story = { args: { id: 'legacy-email', label: 'Email', type: 'email', placeholder: 'name@example.com', hint: undefined } }
export const PlainText: Story = { args: { id: 'legacy-name', label: 'Name', type: 'text', hint: undefined } }
