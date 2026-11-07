import type { Meta, StoryObj } from '@storybook/react-vite'
import { GroupForm } from '../molecules/GroupForm'
import { InputText } from './InputText'

const meta = {
  title: 'Shared UI/Atoms/InputText',
  component: InputText,
  args: { name: 'name', placeholder: 'e.g. Alex Morgan' },
  render: (args) => <div className="max-w-md p-6"><GroupForm controlId="story-name" labelText="Full name"><InputText {...args} /></GroupForm></div>,
  parameters: { docs: { description: { component: 'Plain text control. Pair it with GroupForm, which owns the visible label, hint, and error message.' } } },
} satisfies Meta<typeof InputText>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithHintAndError: Story = {
  render: (args) => <div className="max-w-md p-6"><GroupForm controlId="story-name-error" labelText="Full name" hintText="Use the name shown in your profile." errorText="Enter your full name."><InputText {...args} /></GroupForm></div>,
}
export const Disabled: Story = { args: { disabled: true, defaultValue: 'Alex Morgan' } }
