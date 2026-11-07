import type { Meta, StoryObj } from '@storybook/react-vite'
import { GroupForm } from '../molecules/GroupForm'
import { InputPassword } from './InputPassword'

const meta = {
  title: 'Shared UI/Atoms/InputPassword',
  component: InputPassword,
  args: { name: 'password', autoComplete: 'new-password', placeholder: 'Enter a password' },
  render: (args) => <div className="max-w-md p-6"><GroupForm controlId="story-password" labelText="Password" hintText="Use at least 8 characters."><InputPassword {...args} /></GroupForm></div>,
  parameters: { docs: { description: { component: 'Password input with a keyboard-accessible visibility toggle and native password attributes.' } } },
} satisfies Meta<typeof InputPassword>

export default meta
type Story = StoryObj<typeof meta>

export const HiddenByDefault: Story = {}
export const Disabled: Story = { args: { disabled: true, value: 'example-password' } }
