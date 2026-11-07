import type { Meta, StoryObj } from '@storybook/react-vite'
import { GroupForm } from '../molecules/GroupForm'
import { InputEmail } from './InputEmail'

const meta = {
  title: 'Shared UI/Atoms/InputEmail',
  component: InputEmail,
  args: { name: 'email', placeholder: 'name@example.com', autoComplete: 'email' },
  render: (args) => <div className="max-w-md p-6"><GroupForm controlId="story-email" labelText="Email address"><InputEmail {...args} /></GroupForm></div>,
  parameters: { docs: { description: { component: 'Email control with browser email semantics and GroupForm native validation messaging.' } } },
} satisfies Meta<typeof InputEmail>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Required: Story = { args: { required: true } }
export const Invalid: Story = {
  args: { defaultValue: 'not-an-email' },
  render: (args) => <div className="max-w-md p-6"><GroupForm controlId="story-email-invalid" labelText="Email address" errorText="Enter a valid email address."><InputEmail {...args} /></GroupForm></div>,
}
